import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';

const Customers: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer database"
        breadcrumbs={[
          { label: 'Foundation', path: '/foundation' },
          { label: 'Customers' },
        ]}
        actions={
          <Button variant="primary">
            + Add Customer
          </Button>
        }
      />

      <div className="section">
        <p>Customer management interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include customer CRUD operations, contact information, and relationship tracking.
        </p>
      </div>
    </div>
  );
};

export default Customers;
