# Learning-First Development Framework - MindFlow Implementation Plan

**Status**: Design Phase
**Created**: 2025-11-08
**Applies To**: ConstructionPlatform v2.0 (Learning Intelligence Phase)

---

## Executive Summary

The MindFlow database schema is **already architected** for the Learning-First Development Framework. This document provides a phased implementation roadmap to activate the learning loops that will enable continuous system improvement based on real-world construction data.

**Key Insight**: Your schema has the hooks (`averageVariance`, `confidenceScore`, `VariancePattern`), but the algorithms to populate and act on these fields don't exist yet.

---

## Current State Assessment

### ✅ What You Have (Schema)

1. **Foundation Layer Ready**
   - `PlanTemplateItem.averageVariance` - Historical average variance %
   - `PlanTemplateItem.varianceCount` - Sample size tracking
   - `PlanTemplateItem.confidenceScore` - Accuracy confidence (0-1)
   - `PlanTemplateItem.wasteFactor` - Adjustable based on learning

2. **Transaction Layer Ready**
   - `TakeoffLineItem.variance` - Absolute difference (actual - estimated)
   - `TakeoffLineItem.variancePercent` - Percentage difference
   - `TakeoffLineItem.varianceReason` - Human-annotated explanations

3. **Intelligence Layer Ready**
   - `VariancePattern` table with hierarchical scopes
   - Statistical fields: `sampleSize`, `avgVariance`, `stdDeviation`
   - Confidence scoring: `confidenceScore`
   - Recommendation tracking: `recommendedAdjustment`, `reasoning`

4. **Feedback Layer Ready**
   - `VarianceReview` for human-in-the-loop approval
   - `PatternStatus` workflow: DETECTED → UNDER_REVIEW → APPROVED → APPLIED
   - `ReviewDecision` options: APPROVE, REJECT, NEEDS_MORE_DATA, ESCALATE

5. **Transparency Ready**
   - `PricingHistory.calculationSteps` - JSON array for step-by-step breakdowns
   - Audit trail in `AuditLog`

### ❌ What You're Missing (Algorithms)

1. **Variance Calculation Engine** - Populates variance fields when jobs complete
2. **Pattern Detection Algorithm** - Analyzes variance data to detect statistically significant patterns
3. **Confidence Scoring System** - Calculates confidence scores based on sample size, consistency, recency
4. **Recommendation Generation** - Creates actionable recommendations from patterns
5. **Auto-Application Logic** - Applies high-confidence recommendations automatically
6. **Transparent Pricing Pipeline** - Generates the `calculationSteps` JSON for pedagogical UI

---

## Phase 1: Variance Capture Engine (Weeks 1-2)

### Goal
Automatically calculate and store variance data when `TakeoffLineItem.quantityActual` is recorded.

### Database Trigger Implementation

```sql
-- Trigger to auto-calculate variance when actual quantities are recorded
CREATE OR REPLACE FUNCTION calculate_takeoff_variance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if quantityActual is being set
  IF NEW.quantityActual IS NOT NULL AND (OLD.quantityActual IS NULL OR NEW.quantityActual != OLD.quantityActual) THEN
    -- Calculate absolute variance
    NEW.variance = NEW.quantityActual - NEW.quantityEstimated;

    -- Calculate percentage variance (avoid division by zero)
    IF NEW.quantityEstimated != 0 THEN
      NEW.variancePercent = (NEW.variance / NEW.quantityEstimated) * 100;
    ELSE
      NEW.variancePercent = NULL;
    END IF;

    NEW.updatedAt = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_takeoff_variance
  BEFORE UPDATE ON "TakeoffLineItem"
  FOR EACH ROW
  EXECUTE FUNCTION calculate_takeoff_variance();
```

### Backend Service Implementation

```typescript
// backend/src/services/variance/VarianceCaptureService.ts

export interface VarianceData {
  lineItemId: string;
  variance: number;
  variancePercent: number;
  varianceReason?: string;
}

export class VarianceCaptureService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Record actual quantity for a takeoff line item
   * Variance is auto-calculated by database trigger
   */
  async recordActualQuantity(
    lineItemId: string,
    quantityActual: number,
    varianceReason?: string
  ): Promise<VarianceData> {
    const lineItem = await this.prisma.takeoffLineItem.update({
      where: { id: lineItemId },
      data: {
        quantityActual,
        varianceReason,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        variance: true,
        variancePercent: true,
        varianceReason: true,
      },
    });

    return {
      lineItemId: lineItem.id,
      variance: lineItem.variance?.toNumber() ?? 0,
      variancePercent: lineItem.variancePercent?.toNumber() ?? 0,
      varianceReason: lineItem.varianceReason ?? undefined,
    };
  }

  /**
   * Get variance statistics for a completed job
   */
  async getJobVarianceStats(jobId: string) {
    const takeoff = await this.prisma.takeoff.findUnique({
      where: { jobId },
      include: {
        lineItems: {
          where: {
            quantityActual: { not: null },
          },
          include: {
            material: {
              select: { category: true, description: true },
            },
          },
        },
      },
    });

    if (!takeoff) {
      throw new Error(`Takeoff not found for job ${jobId}`);
    }

    // Calculate variance statistics by category
    const statsByCategory = takeoff.lineItems.reduce((acc, item) => {
      const category = item.material.category;

      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalVariance: 0,
          avgVariance: 0,
          maxVariance: 0,
          minVariance: 0,
        };
      }

      const variance = item.variancePercent?.toNumber() ?? 0;
      acc[category].count++;
      acc[category].totalVariance += variance;
      acc[category].maxVariance = Math.max(acc[category].maxVariance, variance);
      acc[category].minVariance = Math.min(acc[category].minVariance, variance);

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(statsByCategory).forEach((stats: any) => {
      stats.avgVariance = stats.totalVariance / stats.count;
    });

    return {
      jobId,
      takeoffId: takeoff.id,
      lineItemCount: takeoff.lineItems.length,
      statsByCategory,
      capturedAt: new Date(),
    };
  }
}
```

### API Endpoints

```typescript
// backend/src/routes/variance.routes.ts

router.post('/variance/capture/:lineItemId', async (req, res) => {
  const { lineItemId } = req.params;
  const { quantityActual, varianceReason } = req.body;

  const service = new VarianceCaptureService(prisma);
  const result = await service.recordActualQuantity(
    lineItemId,
    quantityActual,
    varianceReason
  );

  res.json(result);
});

router.get('/variance/job/:jobId/stats', async (req, res) => {
  const { jobId } = req.params;

  const service = new VarianceCaptureService(prisma);
  const stats = await service.getJobVarianceStats(jobId);

  res.json(stats);
});
```

### Success Metrics
- ✅ Variance auto-calculated when actuals are recorded
- ✅ Variance reasons captured from field users
- ✅ Job-level variance statistics available
- ✅ Data ready for pattern detection in Phase 2

---

## Phase 2: Pattern Detection Algorithm (Weeks 3-5)

### Goal
Analyze completed jobs to detect statistically significant variance patterns.

### Pattern Detection Service

```typescript
// backend/src/services/intelligence/PatternDetectionService.ts

import { Decimal } from '@prisma/client/runtime/library';

export interface DetectedPattern {
  scope: 'PLAN_SPECIFIC' | 'CROSS_PLAN' | 'COMMUNITY' | 'BUILDER' | 'REGIONAL';
  planId?: string;
  communityId?: string;
  customerId?: string;
  materialCategory: string;
  subcategory?: string;
  sampleSize: number;
  avgVariance: number;
  stdDeviation: number;
  confidenceScore: number;
  recommendedAdjustment?: number;
  reasoning: string;
}

export class PatternDetectionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Detect patterns for a specific plan after N jobs completed
   */
  async detectPlanPatterns(planId: string, minSampleSize: number = 3): Promise<DetectedPattern[]> {
    // Get all completed jobs for this plan with variance data
    const jobs = await this.prisma.job.findMany({
      where: {
        planId,
        status: 'COMPLETED',
        takeoff: {
          lineItems: {
            some: {
              quantityActual: { not: null },
            },
          },
        },
      },
      include: {
        takeoff: {
          include: {
            lineItems: {
              where: {
                quantityActual: { not: null },
              },
              include: {
                material: true,
              },
            },
          },
        },
      },
    });

    if (jobs.length < minSampleSize) {
      return []; // Not enough data yet
    }

    // Group line items by material category
    const itemsByCategory = new Map<string, any[]>();

    jobs.forEach(job => {
      job.takeoff?.lineItems.forEach(item => {
        const category = item.category;
        if (!itemsByCategory.has(category)) {
          itemsByCategory.set(category, []);
        }
        itemsByCategory.get(category)!.push({
          variance: item.variancePercent?.toNumber() ?? 0,
          materialId: item.materialId,
          subcategory: item.subcategory,
        });
      });
    });

    // Analyze each category for patterns
    const patterns: DetectedPattern[] = [];

    for (const [category, items] of itemsByCategory) {
      if (items.length < minSampleSize) continue;

      const variances = items.map(i => i.variance);
      const avgVariance = this.calculateMean(variances);
      const stdDev = this.calculateStdDev(variances);

      // Statistical significance test
      // Pattern is significant if: |avgVariance| > 2% AND consistent (low stdDev)
      if (Math.abs(avgVariance) > 2 && stdDev < 5) {
        const confidence = this.calculateConfidence(items.length, stdDev, avgVariance);

        patterns.push({
          scope: 'PLAN_SPECIFIC',
          planId,
          materialCategory: category,
          subcategory: items[0].subcategory,
          sampleSize: items.length,
          avgVariance,
          stdDeviation: stdDev,
          confidenceScore: confidence,
          recommendedAdjustment: avgVariance,
          reasoning: this.generateReasoning(category, avgVariance, items.length, stdDev),
        });
      }
    }

    return patterns;
  }

  /**
   * Calculate confidence score based on LDF formula
   */
  private calculateConfidence(sampleSize: number, stdDev: number, avgVariance: number): number {
    // Confidence factors (0-1 scale)
    const sampleScore = Math.min(1.0, Math.log(sampleSize) / Math.log(20)); // Maxes at 20 samples
    const consistencyScore = Math.max(0, 1.0 - (stdDev / 10)); // Lower stdDev = higher score
    const magnitudeScore = Math.min(1.0, Math.abs(avgVariance) / 10); // Higher variance = more significant

    // Weighted average
    const confidence = (
      sampleScore * 0.40 +
      consistencyScore * 0.40 +
      magnitudeScore * 0.20
    );

    return Math.round(confidence * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    category: string,
    avgVariance: number,
    sampleSize: number,
    stdDev: number
  ): string {
    const direction = avgVariance > 0 ? 'over-ordering' : 'under-ordering';
    const magnitude = Math.abs(avgVariance).toFixed(1);

    return `Based on ${sampleSize} completed jobs, ${category} materials show consistent ${direction} by ${magnitude}% (σ=${stdDev.toFixed(1)}%). ` +
           `This pattern is statistically significant and suggests the template waste factor should be adjusted.`;
  }

  /**
   * Statistical utility functions
   */
  private calculateMean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateStdDev(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  /**
   * Save detected pattern to database
   */
  async savePattern(pattern: DetectedPattern): Promise<string> {
    const created = await this.prisma.variancePattern.create({
      data: {
        scope: pattern.scope,
        planId: pattern.planId,
        communityId: pattern.communityId,
        customerId: pattern.customerId,
        materialCategory: pattern.materialCategory,
        subcategory: pattern.subcategory,
        sampleSize: pattern.sampleSize,
        avgVariance: new Decimal(pattern.avgVariance),
        stdDeviation: new Decimal(pattern.stdDeviation),
        confidenceScore: new Decimal(pattern.confidenceScore),
        recommendedAdjustment: pattern.recommendedAdjustment
          ? new Decimal(pattern.recommendedAdjustment)
          : null,
        reasoning: pattern.reasoning,
        status: 'DETECTED',
      },
    });

    return created.id;
  }
}
```

### Scheduled Pattern Detection Job

```typescript
// backend/src/jobs/patternDetectionJob.ts

/**
 * Runs nightly to detect new patterns from completed jobs
 */
export async function runPatternDetection() {
  const service = new PatternDetectionService(prisma);

  // Get all active plans
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
  });

  console.log(`[Pattern Detection] Analyzing ${plans.length} active plans...`);

  for (const plan of plans) {
    try {
      const patterns = await service.detectPlanPatterns(plan.id, 3);

      if (patterns.length > 0) {
        console.log(`[Pattern Detection] Found ${patterns.length} patterns for Plan ${plan.code}`);

        for (const pattern of patterns) {
          const patternId = await service.savePattern(pattern);

          // Create notification for review
          if (pattern.confidenceScore >= 0.85) {
            await createPatternReviewNotification(patternId, pattern);
          }
        }
      }
    } catch (error) {
      console.error(`[Pattern Detection] Error analyzing Plan ${plan.code}:`, error);
    }
  }

  console.log('[Pattern Detection] Analysis complete');
}

async function createPatternReviewNotification(patternId: string, pattern: DetectedPattern) {
  // Find estimators to notify
  const estimators = await prisma.user.findMany({
    where: { role: 'ESTIMATOR', isActive: true },
  });

  for (const estimator of estimators) {
    await prisma.notification.create({
      data: {
        userId: estimator.id,
        type: 'PATTERN_REVIEW_REQUIRED',
        title: 'New Variance Pattern Detected',
        message: `A significant pattern was detected: ${pattern.reasoning}`,
        actionUrl: `/patterns/${patternId}/review`,
      },
    });
  }
}
```

### API Endpoints

```typescript
// backend/src/routes/patterns.routes.ts

router.get('/patterns', async (req, res) => {
  const { status, scope, minConfidence } = req.query;

  const patterns = await prisma.variancePattern.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(scope && { scope: scope as any }),
      ...(minConfidence && { confidenceScore: { gte: parseFloat(minConfidence as string) } }),
    },
    include: {
      plan: { select: { code: true, name: true } },
      reviews: { include: { reviewer: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { confidenceScore: 'desc' },
  });

  res.json(patterns);
});

router.post('/patterns/detect/:planId', async (req, res) => {
  const { planId } = req.params;

  const service = new PatternDetectionService(prisma);
  const patterns = await service.detectPlanPatterns(planId);

  res.json({
    planId,
    patternsDetected: patterns.length,
    patterns,
  });
});
```

### Success Metrics
- ✅ Patterns auto-detected from completed jobs
- ✅ Statistical significance validated
- ✅ Confidence scores calculated
- ✅ Notifications sent for high-confidence patterns
- ✅ Data ready for human review and auto-application in Phase 3

---

## Phase 3: Confidence Scoring & Display (Weeks 6-7)

### Goal
Show users the confidence level of estimates based on historical data.

### Confidence Calculation Service

```typescript
// backend/src/services/intelligence/ConfidenceCalculationService.ts

export interface EstimateConfidence {
  overallScore: number; // 0-100
  breakdown: {
    sampleSize: number;
    sampleScore: number;
    consistency: number;
    consistencyScore: number;
    recency: number;
    recencyScore: number;
  };
  message: string;
  color: 'green' | 'yellow' | 'red';
}

export class ConfidenceCalculationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate confidence score for a job estimate
   */
  async calculateJobConfidence(jobId: string): Promise<EstimateConfidence> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { plan: true },
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Get historical data for this plan
    const historicalJobs = await this.prisma.job.findMany({
      where: {
        planId: job.planId,
        status: 'COMPLETED',
        takeoff: {
          lineItems: {
            some: { quantityActual: { not: null } },
          },
        },
      },
      include: {
        takeoff: {
          include: {
            lineItems: {
              where: { quantityActual: { not: null } },
            },
          },
        },
      },
    });

    const sampleSize = historicalJobs.length;

    // Calculate sample size score (logarithmic)
    const sampleScore = Math.min(100, (Math.log(sampleSize + 1) / Math.log(20)) * 100);

    // Calculate consistency (avg stdDev across all categories)
    let totalStdDev = 0;
    let categoryCount = 0;

    const categoryVariances = new Map<string, number[]>();
    historicalJobs.forEach(job => {
      job.takeoff?.lineItems.forEach(item => {
        const category = item.category;
        if (!categoryVariances.has(category)) {
          categoryVariances.set(category, []);
        }
        categoryVariances.get(category)!.push(item.variancePercent?.toNumber() ?? 0);
      });
    });

    categoryVariances.forEach((variances) => {
      const stdDev = this.calculateStdDev(variances);
      totalStdDev += stdDev;
      categoryCount++;
    });

    const avgStdDev = categoryCount > 0 ? totalStdDev / categoryCount : 10;
    const consistencyScore = Math.max(0, Math.min(100, (1 - avgStdDev / 10) * 100));

    // Calculate recency (days since last completed job)
    const lastCompletedDate = historicalJobs[0]?.completionDate;
    const daysSinceLastJob = lastCompletedDate
      ? Math.floor((Date.now() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    const recencyScore = Math.max(0, Math.min(100, Math.exp(-daysSinceLastJob / 90) * 100));

    // Weighted average
    const overallScore = Math.round(
      sampleScore * 0.40 +
      consistencyScore * 0.40 +
      recencyScore * 0.20
    );

    // Determine color and message
    let color: 'green' | 'yellow' | 'red';
    let message: string;

    if (overallScore >= 75) {
      color = 'green';
      message = `High confidence estimate based on ${sampleSize} similar completed jobs`;
    } else if (overallScore >= 50) {
      color = 'yellow';
      message = `Moderate confidence - limited historical data (${sampleSize} jobs)`;
    } else {
      color = 'red';
      message = sampleSize === 0
        ? 'Low confidence - no historical data for this plan'
        : 'Low confidence - historical data shows high variance';
    }

    return {
      overallScore,
      breakdown: {
        sampleSize,
        sampleScore: Math.round(sampleScore),
        consistency: Math.round(avgStdDev * 10) / 10,
        consistencyScore: Math.round(consistencyScore),
        recency: daysSinceLastJob,
        recencyScore: Math.round(recencyScore),
      },
      message,
      color,
    };
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Update template confidence scores for a plan
   */
  async updateTemplateConfidence(planId: string): Promise<void> {
    const templates = await this.prisma.planTemplateItem.findMany({
      where: { planId },
    });

    for (const template of templates) {
      // Get variance data for this template item
      const variances = await this.prisma.takeoffLineItem.findMany({
        where: {
          materialId: template.materialId,
          takeoff: {
            job: {
              planId,
              status: 'COMPLETED',
            },
          },
          quantityActual: { not: null },
        },
        select: {
          variancePercent: true,
        },
      });

      if (variances.length > 0) {
        const values = variances.map(v => v.variancePercent?.toNumber() ?? 0);
        const avgVariance = values.reduce((sum, v) => sum + v, 0) / values.length;
        const stdDev = this.calculateStdDev(values);

        // Calculate confidence
        const sampleScore = Math.min(1.0, Math.log(variances.length) / Math.log(20));
        const consistencyScore = Math.max(0, 1.0 - stdDev / 10);
        const confidence = (sampleScore * 0.5 + consistencyScore * 0.5);

        // Update template
        await this.prisma.planTemplateItem.update({
          where: { id: template.id },
          data: {
            averageVariance: new Decimal(avgVariance),
            varianceCount: variances.length,
            lastVarianceDate: new Date(),
            confidenceScore: new Decimal(confidence),
          },
        });
      }
    }
  }
}
```

### Frontend Component

```tsx
// frontend/src/components/confidence/ConfidenceBadge.tsx

import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceBadgeProps {
  score: number;
  breakdown: {
    sampleSize: number;
    sampleScore: number;
    consistency: number;
    consistencyScore: number;
    recency: number;
    recencyScore: number;
  };
  message: string;
  color: 'green' | 'yellow' | 'red';
}

export function ConfidenceBadge({ score, breakdown, message, color }: ConfidenceBadgeProps) {
  const badgeVariant = {
    green: 'default',
    yellow: 'warning',
    red: 'destructive',
  }[color];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={badgeVariant} className="cursor-help">
          <Info className="w-3 h-3 mr-1" />
          Confidence: {score}%
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="w-80">
        <div className="space-y-2">
          <p className="font-medium">{message}</p>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Sample Size:</span>
              <span>{breakdown.sampleSize} jobs ({breakdown.sampleScore}%)</span>
            </div>
            <div className="flex justify-between">
              <span>Consistency:</span>
              <span>σ={breakdown.consistency}% ({breakdown.consistencyScore}%)</span>
            </div>
            <div className="flex justify-between">
              <span>Recency:</span>
              <span>{breakdown.recency} days ago ({breakdown.recencyScore}%)</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between font-medium">
              <span>Overall Confidence:</span>
              <span>{score}%</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
```

### Success Metrics
- ✅ Confidence scores displayed on all estimates
- ✅ Users can click to see detailed breakdown
- ✅ Template confidence updated after each job
- ✅ Trust built through transparency

---

## Phase 4: Progressive Automation (Weeks 8-10)

### Goal
Implement the LDF progressive automation strategy (Observation → Semi-Auto → Autonomous).

### Automation Configuration

```typescript
// backend/src/config/automation.config.ts

export interface AutomationStage {
  name: 'observation' | 'assistance' | 'semi' | 'intelligent' | 'autonomous';
  thresholds: {
    autoApply: number;      // e.g., 0.95
    review: number;         // e.g., 0.85
    investigate: number;    // e.g., 0.75
  };
  requirements: {
    minSampleSize: number;  // e.g., 5
    maxStdDev: number;      // e.g., 3.0
    minImprovement: number; // e.g., 0.02
  };
  description: string;
}

export const AUTOMATION_STAGES: Record<string, AutomationStage> = {
  observation: {
    name: 'observation',
    thresholds: {
      autoApply: 1.0,  // Never auto-apply
      review: 0.95,
      investigate: 0.85,
    },
    requirements: {
      minSampleSize: 10,
      maxStdDev: 3.0,
      minImprovement: 0.02,
    },
    description: 'System observes and logs patterns only. No automation.',
  },

  assistance: {
    name: 'assistance',
    thresholds: {
      autoApply: 1.0,  // Still no auto-apply
      review: 0.90,
      investigate: 0.75,
    },
    requirements: {
      minSampleSize: 7,
      maxStdDev: 4.0,
      minImprovement: 0.02,
    },
    description: 'System suggests improvements. All require manual approval.',
  },

  semi: {
    name: 'semi',
    thresholds: {
      autoApply: 0.95,  // Auto-apply starts here!
      review: 0.85,
      investigate: 0.75,
    },
    requirements: {
      minSampleSize: 5,
      maxStdDev: 3.0,
      minImprovement: 0.02,
    },
    description: 'High-confidence patterns auto-applied. Medium patterns queued for review.',
  },

  intelligent: {
    name: 'intelligent',
    thresholds: {
      autoApply: 0.90,  // Lower threshold for auto-apply
      review: 0.80,
      investigate: 0.70,
    },
    requirements: {
      minSampleSize: 3,
      maxStdDev: 5.0,
      minImprovement: 0.01,
    },
    description: 'System auto-applies most patterns with notification. Exceptions only for review.',
  },

  autonomous: {
    name: 'autonomous',
    thresholds: {
      autoApply: 0.85,  // Very aggressive auto-application
      review: 0.75,
      investigate: 0.60,
    },
    requirements: {
      minSampleSize: 3,
      maxStdDev: 6.0,
      minImprovement: 0.01,
    },
    description: 'Full automation. System self-improves with minimal human oversight.',
  },
};

// Current stage (should be configurable per organization/user)
export let CURRENT_AUTOMATION_STAGE: AutomationStage = AUTOMATION_STAGES.observation;

export function setAutomationStage(stageName: string) {
  const stage = AUTOMATION_STAGES[stageName];
  if (!stage) {
    throw new Error(`Unknown automation stage: ${stageName}`);
  }
  CURRENT_AUTOMATION_STAGE = stage;
  console.log(`[Automation] Stage updated to: ${stage.name} - ${stage.description}`);
}
```

### Recommendation Processing Service

```typescript
// backend/src/services/feedback/RecommendationProcessor.ts

import { CURRENT_AUTOMATION_STAGE } from '@/config/automation.config';

export class RecommendationProcessor {
  constructor(private prisma: PrismaClient) {}

  /**
   * Process a detected pattern and determine action
   */
  async processPattern(patternId: string): Promise<'auto_applied' | 'queued_for_review' | 'logged'> {
    const pattern = await this.prisma.variancePattern.findUnique({
      where: { id: patternId },
    });

    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`);
    }

    const stage = CURRENT_AUTOMATION_STAGE;
    const confidence = pattern.confidenceScore.toNumber();
    const sampleSize = pattern.sampleSize;
    const stdDev = pattern.stdDeviation.toNumber();

    // Check requirements
    const meetsRequirements =
      sampleSize >= stage.requirements.minSampleSize &&
      stdDev <= stage.requirements.maxStdDev &&
      Math.abs(pattern.avgVariance.toNumber()) >= stage.requirements.minImprovement * 100;

    if (!meetsRequirements) {
      console.log(`[Automation] Pattern ${patternId} does not meet requirements`);
      return 'logged';
    }

    // Determine action based on confidence and stage
    if (confidence >= stage.thresholds.autoApply) {
      // AUTO-APPLY
      await this.autoApplyPattern(pattern);
      return 'auto_applied';
    } else if (confidence >= stage.thresholds.review) {
      // QUEUE FOR REVIEW
      await this.queueForReview(pattern);
      return 'queued_for_review';
    } else {
      // JUST LOG
      console.log(`[Automation] Pattern ${patternId} below review threshold (${confidence} < ${stage.thresholds.review})`);
      return 'logged';
    }
  }

  /**
   * Auto-apply a high-confidence pattern
   */
  private async autoApplyPattern(pattern: any): Promise<void> {
    console.log(`[Automation] AUTO-APPLYING pattern ${pattern.id} (confidence: ${pattern.confidenceScore})`);

    // Update template waste factors based on pattern
    if (pattern.scope === 'PLAN_SPECIFIC' && pattern.planId) {
      const templates = await this.prisma.planTemplateItem.findMany({
        where: {
          planId: pattern.planId,
          category: pattern.materialCategory,
        },
      });

      for (const template of templates) {
        const currentWasteFactor = template.wasteFactor.toNumber();
        const adjustment = pattern.recommendedAdjustment?.toNumber() ?? 0;
        const newWasteFactor = currentWasteFactor + adjustment;

        await this.prisma.planTemplateItem.update({
          where: { id: template.id },
          data: {
            wasteFactor: new Decimal(Math.max(0, newWasteFactor)), // Don't go negative
            updatedAt: new Date(),
          },
        });

        // Log to audit trail
        await this.prisma.auditLog.create({
          data: {
            action: 'AUTO_UPDATE_WASTE_FACTOR',
            entityType: 'PlanTemplateItem',
            entityId: template.id,
            changes: {
              oldWasteFactor: currentWasteFactor,
              newWasteFactor,
              adjustment,
              patternId: pattern.id,
              confidence: pattern.confidenceScore.toNumber(),
              automationStage: CURRENT_AUTOMATION_STAGE.name,
            },
          },
        });
      }

      // Update pattern status
      await this.prisma.variancePattern.update({
        where: { id: pattern.id },
        data: {
          status: 'APPLIED',
          appliedAt: new Date(),
        },
      });

      // Send notification
      await this.sendAutoAppliedNotification(pattern);
    }
  }

  /**
   * Queue pattern for human review
   */
  private async queueForReview(pattern: any): Promise<void> {
    console.log(`[Automation] QUEUING pattern ${pattern.id} for review (confidence: ${pattern.confidenceScore})`);

    // Update status
    await this.prisma.variancePattern.update({
      where: { id: pattern.id },
      data: {
        status: 'UNDER_REVIEW',
        reviewedAt: null,
      },
    });

    // Create notifications for estimators
    const estimators = await this.prisma.user.findMany({
      where: { role: 'ESTIMATOR', isActive: true },
    });

    for (const estimator of estimators) {
      await this.prisma.notification.create({
        data: {
          userId: estimator.id,
          type: 'PATTERN_REVIEW_REQUIRED',
          title: 'Pattern Review Required',
          message: `A variance pattern was detected: ${pattern.reasoning}`,
          actionUrl: `/patterns/${pattern.id}/review`,
        },
      });
    }
  }

  private async sendAutoAppliedNotification(pattern: any): Promise<void> {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
    });

    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'Pattern Auto-Applied',
          message: `System automatically updated template based on pattern: ${pattern.reasoning}`,
          actionUrl: `/patterns/${pattern.id}`,
        },
      });
    }
  }

  /**
   * Manual approval of a pattern
   */
  async approvePattern(patternId: string, userId: string, notes?: string): Promise<void> {
    // Create review record
    await this.prisma.varianceReview.create({
      data: {
        patternId,
        reviewerId: userId,
        decision: 'APPROVE',
        notes,
      },
    });

    // Apply the pattern
    const pattern = await this.prisma.variancePattern.findUnique({
      where: { id: patternId },
    });

    if (pattern) {
      await this.autoApplyPattern(pattern);
    }
  }

  /**
   * Manual rejection of a pattern
   */
  async rejectPattern(patternId: string, userId: string, notes?: string): Promise<void> {
    await this.prisma.varianceReview.create({
      data: {
        patternId,
        reviewerId: userId,
        decision: 'REJECT',
        notes,
      },
    });

    await this.prisma.variancePattern.update({
      where: { id: patternId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
      },
    });
  }
}
```

### API Endpoints

```typescript
// backend/src/routes/automation.routes.ts

router.get('/automation/stage', async (req, res) => {
  res.json({
    current: CURRENT_AUTOMATION_STAGE.name,
    description: CURRENT_AUTOMATION_STAGE.description,
    thresholds: CURRENT_AUTOMATION_STAGE.thresholds,
    requirements: CURRENT_AUTOMATION_STAGE.requirements,
  });
});

router.post('/automation/stage', async (req, res) => {
  const { stage } = req.body;

  setAutomationStage(stage);

  res.json({
    success: true,
    stage: CURRENT_AUTOMATION_STAGE.name,
  });
});

router.post('/patterns/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.user.id; // From auth middleware

  const processor = new RecommendationProcessor(prisma);
  await processor.approvePattern(id, userId, notes);

  res.json({ success: true });
});

router.post('/patterns/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.user.id;

  const processor = new RecommendationProcessor(prisma);
  await processor.rejectPattern(id, userId, notes);

  res.json({ success: true });
});
```

### Success Metrics
- ✅ Automation stage configurable (start in "observation")
- ✅ High-confidence patterns auto-applied (in semi+ stages)
- ✅ Medium-confidence patterns queued for review
- ✅ Full audit trail of all automated decisions
- ✅ User override capabilities maintained

---

## Phase 5: Transparent Pricing Pipeline (Weeks 11-14)

### Goal
Implement the "show your work" pricing calculation with step-by-step breakdowns.

### Pricing Calculation Service

```typescript
// backend/src/services/pricing/TransparentPricingService.ts

export interface CalculationStep {
  description: string;
  formula?: string;
  value: number;
  source?: string;
  confidence?: number;
}

export interface PricingResult {
  finalPrice: number;
  steps: CalculationStep[];
  confidence: number;
  lastUpdated: Date;
}

export class TransparentPricingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate material price with full transparency
   */
  async calculateMaterialPrice(
    materialId: string,
    customerId?: string,
    effectiveDate: Date = new Date()
  ): Promise<PricingResult> {
    const steps: CalculationStep[] = [];

    // Get material
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: { vendor: true },
    });

    if (!material) {
      throw new Error(`Material ${materialId} not found`);
    }

    // Step 1: Base vendor cost
    let runningTotal = material.vendorCost.toNumber();
    steps.push({
      description: 'Base Vendor Cost',
      formula: `${material.vendor?.name ?? 'Vendor'} list price`,
      value: runningTotal,
      source: `vendor_${material.vendorId}`,
      confidence: 1.0,
    });

    // Step 2: Commodity adjustment (if RL-linked)
    if (material.isRLLinked && material.rlTag) {
      const rlPricing = await this.prisma.randomLengthsPricing.findFirst({
        where: {
          tag: material.rlTag,
          effectiveDate: { lte: effectiveDate },
        },
        orderBy: { effectiveDate: 'desc' },
      });

      if (rlPricing && material.rlBasePrice) {
        const commodityAdjustment = rlPricing.price.toNumber() - material.rlBasePrice.toNumber();
        runningTotal += commodityAdjustment;

        steps.push({
          description: 'Commodity Price Adjustment',
          formula: `Current RL price ($${rlPricing.price}) - Base ($${material.rlBasePrice})`,
          value: commodityAdjustment,
          source: `random_lengths_${rlPricing.effectiveDate.toISOString().split('T')[0]}`,
          confidence: 0.95,
        });
      }
    }

    // Step 3: Freight
    const freight = material.freight.toNumber();
    runningTotal += freight;
    steps.push({
      description: 'Freight',
      formula: 'Delivery cost per unit',
      value: freight,
      source: 'shipping_rates',
      confidence: 0.90,
    });

    // Step 4: Total cost before margin
    steps.push({
      description: 'Total Cost',
      formula: steps.map(s => s.description).join(' + '),
      value: runningTotal,
      confidence: Math.min(...steps.map(s => s.confidence ?? 1.0)),
    });

    // Step 5: Customer-specific discount (if applicable)
    let discountPercent = 0;
    if (customerId) {
      const customerPricing = await this.prisma.customerPricing.findUnique({
        where: {
          customerId_materialId: { customerId, materialId },
        },
      });

      if (customerPricing?.discountPercentage) {
        discountPercent = customerPricing.discountPercentage.toNumber();
        const discountAmount = runningTotal * (discountPercent / 100);

        steps.push({
          description: `Customer Discount (${discountPercent}%)`,
          formula: `Total cost × ${discountPercent}%`,
          value: -discountAmount,
          source: `customer_${customerId}`,
          confidence: 1.0,
        });

        runningTotal -= discountAmount;
      }
    }

    // Step 6: Margin (default 20%)
    const marginPercent = 20;
    const marginAmount = runningTotal * (marginPercent / 100);
    runningTotal += marginAmount;

    steps.push({
      description: `Margin (${marginPercent}%)`,
      formula: `Subtotal × ${marginPercent}%`,
      value: marginAmount,
      source: 'company_policy',
      confidence: 1.0,
    });

    // Step 7: Final price
    steps.push({
      description: 'Final Unit Price',
      formula: 'Cost + Margin',
      value: runningTotal,
      confidence: Math.min(...steps.map(s => s.confidence ?? 1.0)),
    });

    // Save pricing history
    await this.savePricingHistory(materialId, steps, runningTotal);

    return {
      finalPrice: Math.round(runningTotal * 100) / 100,
      steps,
      confidence: Math.min(...steps.map(s => s.confidence ?? 1.0)),
      lastUpdated: new Date(),
    };
  }

  private async savePricingHistory(materialId: string, steps: CalculationStep[], finalPrice: number) {
    const totalCost = steps.find(s => s.description === 'Total Cost')?.value ?? 0;
    const marginAmount = steps.find(s => s.description.startsWith('Margin'))?.value ?? 0;
    const marginPercent = (marginAmount / totalCost) * 100;

    await this.prisma.pricingHistory.create({
      data: {
        materialId,
        baseVendorCost: new Decimal(steps[0].value),
        commodityAdjustment: new Decimal(steps.find(s => s.description === 'Commodity Price Adjustment')?.value ?? 0),
        freight: new Decimal(steps.find(s => s.description === 'Freight')?.value ?? 0),
        totalCost: new Decimal(totalCost),
        marginPercentage: new Decimal(marginPercent),
        marginAmount: new Decimal(marginAmount),
        unitPrice: new Decimal(finalPrice),
        calculationSteps: steps, // Store as JSON
        effectiveDate: new Date(),
      },
    });
  }
}
```

### Frontend Component

```tsx
// frontend/src/components/pricing/PricingBreakdown.tsx

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalculationStep {
  description: string;
  formula?: string;
  value: number;
  source?: string;
  confidence?: number;
}

interface PricingBreakdownProps {
  price: number;
  steps: CalculationStep[];
  confidence: number;
}

export function PricingBreakdown({ price, steps, confidence }: PricingBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl">${price.toFixed(2)}</CardTitle>
            <span className="text-sm text-gray-500">per unit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {confidence * 100}% confidence
            </span>
            <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex justify-between items-start p-2 rounded ${
                  step.description.startsWith('Final') ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{step.description}</div>
                  {step.formula && (
                    <div className="text-sm text-gray-600 font-mono">{step.formula}</div>
                  )}
                  {step.source && (
                    <div className="text-xs text-gray-500 mt-1">
                      Source: {step.source}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={step.value < 0 ? 'text-green-600' : ''}>
                    {step.value < 0 ? '-' : ''}${Math.abs(step.value).toFixed(2)}
                  </div>
                  {step.confidence && step.confidence < 1 && (
                    <div className="text-xs text-gray-500">
                      {(step.confidence * 100).toFixed(0)}% confidence
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <Info className="w-4 h-4" />
              Learn more about pricing calculations
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
```

### Success Metrics
- ✅ Every price shows full calculation breakdown
- ✅ Users can click to see step-by-step derivation
- ✅ Confidence shown for each step
- ✅ Sources cited (vendor, RL report, customer contract)
- ✅ Trust built through radical transparency

---

## Phase 6: Hierarchical Learning (Weeks 15-18)

### Goal
Enable cross-plan, community-level, and builder-level pattern detection.

### Hierarchical Pattern Detection

```typescript
// backend/src/services/intelligence/HierarchicalPatternDetection.ts

export class HierarchicalPatternDetectionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Detect patterns at all hierarchy levels
   */
  async detectAllLevels(): Promise<void> {
    console.log('[Hierarchical Learning] Starting multi-level pattern detection...');

    // Level 1: Plan-specific patterns
    await this.detectPlanSpecificPatterns();

    // Level 2: Cross-plan patterns (same customer)
    await this.detectCrossPlanPatterns();

    // Level 3: Community-level patterns
    await this.detectCommunityPatterns();

    // Level 4: Builder-level patterns
    await this.detectBuilderPatterns();

    console.log('[Hierarchical Learning] Multi-level detection complete');
  }

  /**
   * Level 1: Plan-specific patterns (already implemented in Phase 2)
   */
  private async detectPlanSpecificPatterns(): Promise<void> {
    const plans = await this.prisma.plan.findMany({ where: { isActive: true } });
    const service = new PatternDetectionService(this.prisma);

    for (const plan of plans) {
      const patterns = await service.detectPlanPatterns(plan.id, 3);

      for (const pattern of patterns) {
        await service.savePattern(pattern);
      }
    }
  }

  /**
   * Level 2: Cross-plan patterns
   * Example: "All two-story plans use 8% more lumber than estimated"
   */
  private async detectCrossPlanPatterns(): Promise<void> {
    const planTypes = await this.prisma.plan.groupBy({
      by: ['type'],
      where: { isActive: true },
    });

    for (const { type } of planTypes) {
      // Get all jobs for this plan type
      const jobs = await this.prisma.job.findMany({
        where: {
          plan: { type },
          status: 'COMPLETED',
          takeoff: {
            lineItems: {
              some: { quantityActual: { not: null } },
            },
          },
        },
        include: {
          takeoff: {
            include: {
              lineItems: {
                where: { quantityActual: { not: null } },
              },
            },
          },
        },
      });

      if (jobs.length < 5) continue; // Need more data

      // Analyze by category
      const categoryData = new Map<string, number[]>();

      jobs.forEach(job => {
        job.takeoff?.lineItems.forEach(item => {
          if (!categoryData.has(item.category)) {
            categoryData.set(item.category, []);
          }
          categoryData.get(item.category)!.push(item.variancePercent?.toNumber() ?? 0);
        });
      });

      // Detect patterns
      for (const [category, variances] of categoryData) {
        if (variances.length < 5) continue;

        const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;
        const stdDev = this.calculateStdDev(variances);

        if (Math.abs(avgVariance) > 3 && stdDev < 6) {
          // Significant cross-plan pattern detected!
          const confidence = this.calculateConfidence(variances.length, stdDev, avgVariance);

          await this.prisma.variancePattern.create({
            data: {
              scope: 'CROSS_PLAN',
              materialCategory: category,
              sampleSize: variances.length,
              avgVariance: new Decimal(avgVariance),
              stdDeviation: new Decimal(stdDev),
              confidenceScore: new Decimal(confidence),
              recommendedAdjustment: new Decimal(avgVariance),
              reasoning: `Cross-plan analysis of ${variances.length} ${type} homes shows ${category} materials consistently vary by ${avgVariance.toFixed(1)}%.`,
              status: 'DETECTED',
            },
          });
        }
      }
    }
  }

  /**
   * Level 3: Community-level patterns
   * Example: "Willow Ridge community: all jobs use 5% extra lumber (muddy site conditions)"
   */
  private async detectCommunityPatterns(): Promise<void> {
    const communities = await this.prisma.community.findMany({
      where: { isActive: true },
    });

    for (const community of communities) {
      const jobs = await this.prisma.job.findMany({
        where: {
          communityId: community.id,
          status: 'COMPLETED',
          takeoff: {
            lineItems: {
              some: { quantityActual: { not: null } },
            },
          },
        },
        include: {
          takeoff: {
            include: {
              lineItems: {
                where: { quantityActual: { not: null } },
              },
            },
          },
        },
      });

      if (jobs.length < 3) continue;

      const categoryData = new Map<string, number[]>();

      jobs.forEach(job => {
        job.takeoff?.lineItems.forEach(item => {
          if (!categoryData.has(item.category)) {
            categoryData.set(item.category, []);
          }
          categoryData.get(item.category)!.push(item.variancePercent?.toNumber() ?? 0);
        });
      });

      for (const [category, variances] of categoryData) {
        if (variances.length < 3) continue;

        const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;
        const stdDev = this.calculateStdDev(variances);

        if (Math.abs(avgVariance) > 3 && stdDev < 8) {
          const confidence = this.calculateConfidence(variances.length, stdDev, avgVariance);

          await this.prisma.variancePattern.create({
            data: {
              scope: 'COMMUNITY',
              communityId: community.id,
              materialCategory: category,
              sampleSize: variances.length,
              avgVariance: new Decimal(avgVariance),
              stdDeviation: new Decimal(stdDev),
              confidenceScore: new Decimal(confidence),
              recommendedAdjustment: new Decimal(avgVariance),
              reasoning: `${community.name}: ${category} materials show ${avgVariance.toFixed(1)}% variance across ${variances.length} jobs.`,
              status: 'DETECTED',
            },
          });
        }
      }
    }
  }

  /**
   * Level 4: Builder-level patterns
   * Example: "Richmond American: always orders 5% safety stock"
   */
  private async detectBuilderPatterns(): Promise<void> {
    const customers = await this.prisma.customer.findMany({
      where: { isActive: true },
    });

    for (const customer of customers) {
      const jobs = await this.prisma.job.findMany({
        where: {
          customerId: customer.id,
          status: 'COMPLETED',
          takeoff: {
            lineItems: {
              some: { quantityActual: { not: null } },
            },
          },
        },
        include: {
          takeoff: {
            include: {
              lineItems: {
                where: { quantityActual: { not: null } },
              },
            },
          },
        },
      });

      if (jobs.length < 5) continue;

      const categoryData = new Map<string, number[]>();

      jobs.forEach(job => {
        job.takeoff?.lineItems.forEach(item => {
          if (!categoryData.has(item.category)) {
            categoryData.set(item.category, []);
          }
          categoryData.get(item.category)!.push(item.variancePercent?.toNumber() ?? 0);
        });
      });

      for (const [category, variances] of categoryData) {
        if (variances.length < 5) continue;

        const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;
        const stdDev = this.calculateStdDev(variances);

        if (Math.abs(avgVariance) > 3 && stdDev < 7) {
          const confidence = this.calculateConfidence(variances.length, stdDev, avgVariance);

          await this.prisma.variancePattern.create({
            data: {
              scope: 'BUILDER',
              customerId: customer.id,
              materialCategory: category,
              sampleSize: variances.length,
              avgVariance: new Decimal(avgVariance),
              stdDeviation: new Decimal(stdDev),
              confidenceScore: new Decimal(confidence),
              recommendedAdjustment: new Decimal(avgVariance),
              reasoning: `${customer.customerName}: ${category} materials show ${avgVariance.toFixed(1)}% variance across all plans (${variances.length} jobs).`,
              status: 'DETECTED',
            },
          });
        }
      }
    }
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateConfidence(sampleSize: number, stdDev: number, avgVariance: number): number {
    const sampleScore = Math.min(1.0, Math.log(sampleSize) / Math.log(20));
    const consistencyScore = Math.max(0, 1.0 - stdDev / 10);
    const magnitudeScore = Math.min(1.0, Math.abs(avgVariance) / 10);

    return (sampleScore * 0.4 + consistencyScore * 0.4 + magnitudeScore * 0.2);
  }
}
```

### Success Metrics
- ✅ Patterns detected at plan, cross-plan, community, and builder levels
- ✅ Higher-level patterns applied to all relevant entities
- ✅ Pattern propagation (plan → community → builder)
- ✅ Learning scales across entire organization

---

## Implementation Timeline

### 6-Month MVP Roadmap

| Phase | Duration | Deliverables | Status |
|-------|----------|--------------|--------|
| **Phase 1**: Variance Capture | Weeks 1-2 | Database triggers, API endpoints, basic stats | 🟡 Ready to start |
| **Phase 2**: Pattern Detection | Weeks 3-5 | Detection algorithms, statistical analysis, nightly job | 🟡 Ready to start |
| **Phase 3**: Confidence Scoring | Weeks 6-7 | Confidence calculation, UI badges, trust metrics | 🟡 Ready to start |
| **Phase 4**: Progressive Automation | Weeks 8-10 | Automation stages, auto-application, human review | 🟡 Ready to start |
| **Phase 5**: Transparent Pricing | Weeks 11-14 | Calculation engine, step-by-step UI, pedagogical design | 🟡 Ready to start |
| **Phase 6**: Hierarchical Learning | Weeks 15-18 | Multi-level detection, pattern propagation | 🟡 Ready to start |
| **Testing & Refinement** | Weeks 19-24 | Integration testing, user acceptance, rollout | 🟡 Ready to start |

---

## Success Criteria

### Technical Metrics
- ✅ Variance captured for 100% of completed jobs
- ✅ Patterns detected within 24 hours of job completion
- ✅ 95%+ confidence patterns auto-applied (in semi+ stages)
- ✅ <1% false positive rate on pattern detection
- ✅ Full pricing transparency (every calculation traceable)

### Business Metrics
- 📈 25%+ reduction in estimate variance within 6 months
- 📈 50%+ reduction in time spent updating templates manually
- 📈 90%+ user acceptance of auto-applied recommendations
- 📈 2x increase in estimate confidence scores
- 📈 15%+ improvement in win rate (more accurate bids)

### User Trust Metrics
- 👍 80%+ users "trust" confidence scores
- 👍 70%+ users regularly click pricing breakdowns
- 👍 90%+ users approve high-confidence recommendations
- 👍 <5% override rate on auto-applied patterns

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Over-automation | Medium | High | Start in "observation" stage for 3 months minimum |
| Data quality issues | High | High | Validation rules, human variance reasons required |
| Pattern false positives | Medium | Medium | Statistical significance testing (p < 0.05) |
| User resistance to automation | Low | High | Transparency, education, gradual rollout |
| Concept drift (patterns change over time) | Medium | Medium | Periodic revalidation, recency weighting |
| System learns wrong patterns | Low | Very High | Human review for medium-confidence, audit trail |

---

## Next Steps

1. **Review & Approval** (1 week)
   - Present plan to stakeholders
   - Get buy-in on automation strategy
   - Finalize timeline and resources

2. **Phase 1 Kickoff** (Week 1-2)
   - Implement variance capture triggers
   - Build API endpoints
   - Test with sample data

3. **Continuous Monitoring**
   - Weekly metrics review
   - Monthly automation stage assessment
   - Quarterly business impact analysis

---

## Conclusion

Your ConstructionPlatform is **uniquely positioned** to implement the Learning-First Development Framework because:

1. ✅ **Schema is ready** - All LDF layers already architected
2. ✅ **Domain is perfect** - Construction has high variance, predictable patterns
3. ✅ **Data is available** - Actual quantities captured from field
4. ✅ **Value is clear** - More accurate estimates = better margins
5. ✅ **Trust mechanisms exist** - Transparency fields already in schema

**The missing piece is implementation.** This plan provides a clear 18-week roadmap to activate your learning loops and transform MindFlow into a self-improving construction intelligence platform.

**Recommendation**: Start with Phase 1 (Variance Capture) immediately. It's low-risk, high-value, and enables everything else.
