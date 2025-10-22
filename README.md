# Multi-Builder Bid Assistance Tool

A comprehensive web-based pricing and bidding management system designed for construction companies managing multiple builders and housing projects.

## Features

### Core Functionality

- **Multi-Builder Support**: Easily switch between different builders (Holt Homes, Richmond American) with isolated data sets
- **Plan Library Management**: Create, edit, and organize floor plans with detailed specifications
- **Pricing Management**: Track material costs, margins, and calculated pricing
- **Options & Upgrades**: Manage optional features and upgrades with pricing
- **Community Management**: Track community-specific requirements and active plans
- **Pack Definitions**: Define material packs with scheduling and lead times
- **Material Database**: Comprehensive material catalog with vendor costs and freight

### Specialty Calculators

Built-in calculators for common construction scenarios:

- **Pony Wall Calculator**: Calculate materials and costs for pony wall installations
- **Fencing Calculator**: Estimate fencing materials based on linear feet and specifications
- **Deck Calculator**: Compute deck framing, surface materials, and railing costs
- **Stairs & Landing Calculator**: Calculate stair stringers, treads, risers, and landing materials

### Reporting & Analytics

- **Margin Analysis**: Review profit margins by category and overall performance
- **Pricing Summary**: Export current pricing across all materials and options
- **Plan Comparison**: Compare plans side-by-side with statistics
- **Options Pricing Report**: Analyze options by category with pricing details

### Data Management

- **CSV Export**: Export all data types to CSV for external analysis
- **CSV Import**: Import pricing and material data from spreadsheets (planned)
- **Local Storage**: All data persists in browser localStorage
- **Builder Isolation**: Each builder maintains separate data sets

## Project Structure

```
salesteamone/
├── index.html              # Main application entry point
├── css/
│   └── styles.css         # Application styles
├── js/
│   ├── app.js            # Main application logic
│   ├── storage.js        # Data storage and management
│   ├── modals.js         # Modal dialogs and forms
│   ├── calculators.js    # Specialty calculators
│   └── reports.js        # Report generation
├── data/                  # Data directory (for future use)
└── README.md             # This file
```

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CBoser/salesteamone.git
   cd salesteamone
   ```

2. Open `index.html` in a modern web browser:
   - Chrome (recommended)
   - Firefox
   - Safari
   - Edge

No build process or server required - this is a pure client-side application.

### First Steps

1. **Select Your Builder**: Use the builder dropdown in the header to select which builder's data to work with

2. **Add Plans**: Navigate to "Plans Library" and click "Add New Plan" to create your first floor plan

3. **Set Up Materials**: Go to "Material Database" and add materials with vendor costs

4. **Configure Pricing**: In "Pricing Management", add pricing items with costs and margins

5. **Define Communities**: Add communities with their specific requirements

6. **Create Options**: Set up optional features and upgrades in "Options & Upgrades"

## Usage Guide

### Managing Plans

Plans are the foundation of your bidding system. Each plan includes:

- Plan code (unique identifier)
- Plan name
- Type (Single Story, Two Story, etc.)
- Square footage
- Bedrooms and bathrooms
- Garage configuration
- Style
- Available elevations

**To add a plan:**
1. Click "Plans Library" tab
2. Click "Add New Plan"
3. Fill in the form
4. Click "Save Plan"

### Pricing Management

Pricing items link to materials and include markup calculations:

- **Unit Cost**: Your actual cost from vendor
- **Margin %**: Your desired profit margin
- **Unit Price**: Automatically calculated selling price

Formula: `Unit Price = Unit Cost / (1 - Margin%/100)`

Example: $10 cost with 20% margin = $12.50 selling price

### Using Calculators

Each calculator is designed for specific construction scenarios:

**Pony Wall Example:**
1. Navigate to "Calculators" tab
2. Click "Pony Wall Calculator"
3. Enter linear feet and height
4. Select stud spacing and wall type
5. Click "Calculate"
6. Review material list and estimated cost

### Generating Reports

Reports provide insights into your pricing and margins:

1. Navigate to "Reports" tab
2. Click the desired report type
3. Review the analysis
4. Click "Export to CSV" to download

### Data Export/Import

**Export Data:**
- Click the "Export" button on any data table
- CSV file downloads automatically
- Open in Excel, Google Sheets, or similar

**Import Data** (Coming Soon):
- Prepare CSV in the correct format (export first to see structure)
- Use Import button to select file
- Data validates and imports

## Data Storage

All data is stored locally in your browser's localStorage:

- Data persists between sessions
- Each builder has isolated data
- No server required
- No data sent externally

### Clearing Data

To reset all data:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Select Local Storage
4. Right-click and clear

Or clear browser data through browser settings.

## Browser Compatibility

- **Chrome/Edge**: Fully supported
- **Firefox**: Fully supported
- **Safari**: Fully supported
- **Mobile**: Responsive design works on tablets and phones

Minimum browser versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Tips & Best Practices

1. **Regular Backups**: Export your data regularly as CSV backups
2. **Consistent Naming**: Use consistent naming conventions for plans and materials
3. **Update Pricing**: Review and update material costs quarterly
4. **Builder Separation**: Keep builder data completely separate
5. **Documentation**: Use the Notes field in plans for important details

## Troubleshooting

### Data Not Saving
- Check browser localStorage is enabled
- Verify you're not in Private/Incognito mode
- Check available storage space

### Missing Features
- Ensure JavaScript is enabled
- Clear browser cache and reload
- Check browser console for errors (F12)

### Performance Issues
- Limit materials shown (first 50 displayed)
- Use search filters to narrow results
- Export old data and clear if needed

## Future Enhancements

Planned features for future releases:

- [ ] Excel file import functionality
- [ ] Advanced search and filtering
- [ ] Batch operations
- [ ] Print-friendly views
- [ ] Builder comparison reports
- [ ] Historical pricing tracking
- [ ] User authentication (multi-user)
- [ ] Cloud storage integration
- [ ] Mobile app version
- [ ] API integration with builder systems

## Technical Details

### Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **Vanilla JavaScript**: No frameworks required
- **localStorage API**: Client-side data persistence

### File Organization

- **Modular Architecture**: Separate concerns (storage, UI, business logic)
- **Event-Driven**: Clean event handling and delegation
- **Responsive Design**: Mobile-first CSS approach
- **Progressive Enhancement**: Works without JavaScript for basic content

## Support

For issues, questions, or feature requests:

- Create an issue on GitHub
- Contact the development team
- Check documentation in code comments

## License

Copyright 2025 - All rights reserved

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Changelog

### Version 1.0.0 (Current)

- Initial release
- Multi-builder support
- Plan management
- Pricing and materials management
- Community and options management
- Pack definitions
- Four specialty calculators
- Four report types
- CSV export functionality
- Responsive design

---

Built with dedication for the construction industry. Helping builders bid smarter.
