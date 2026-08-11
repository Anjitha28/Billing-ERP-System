"use client";

import { useState } from 'react';
import { useSettings, AppSettings } from '@/hooks/useSettings';

export function SettingsClient() {
  const { settings, saveSettings, resetSettings, isLoaded } = useSettings();
  const [activeTab, setActiveTab] = useState('business');
  
  // Local state for form values to allow unsaved edits
  const [formValues, setFormValues] = useState<Partial<AppSettings>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  if (!isLoaded) {
    return <div className="p-8 text-center text-theme-text-muted">Loading settings...</div>;
  }

  // Combine saved settings with current form edits
  const currentValues = { ...settings, ...formValues };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsDirty(true);
    setMessage(null);
  };

  const handleSave = () => {
    const success = saveSettings(formValues);
    if (success) {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setIsDirty(false);
      setFormValues({}); // Clear local edits since they are now saved
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to their defaults?')) {
      const success = resetSettings();
      if (success) {
        setFormValues({});
        setIsDirty(false);
        setMessage({ type: 'success', text: 'Settings reset to defaults.' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const tabs = [
    { id: 'business', label: 'Business Profile' },
    { id: 'tax', label: 'Tax Information' },
    { id: 'invoice', label: 'Invoice Settings' },
    { id: 'financial_year', label: 'Financial Year' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'display', label: 'Display Settings' },
  ];

  return (
    <div className="bg-theme-surface rounded-lg shadow border border-theme-border flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-theme-border bg-theme-surface-hover p-4">
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-theme-surface-hover text-theme-primary-dark' 
                  : 'text-gray-200 hover:bg-theme-surface-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-theme-surface-hover text-green-800 border-green-200' : 'bg-red-900/20 text-red-800 border-red-200'} border`}>
            {message.text}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2">
          {/* 1. BUSINESS PROFILE */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme-text border-b pb-2">Business Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Business Name</label>
                  <input type="text" name="businessName" value={currentValues.businessName} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Legal Name</label>
                  <input type="text" name="legalName" value={currentValues.legalName} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200">Business Address</label>
                  <textarea name="businessAddress" value={currentValues.businessAddress} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">City</label>
                  <input type="text" name="city" value={currentValues.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">State</label>
                  <input type="text" name="state" value={currentValues.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">State Code</label>
                  <input type="text" name="stateCode" value={currentValues.stateCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">PIN Code</label>
                  <input type="text" name="pinCode" value={currentValues.pinCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Country</label>
                  <input type="text" name="country" value={currentValues.country} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Phone</label>
                  <input type="text" name="phone" value={currentValues.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Email</label>
                  <input type="email" name="email" value={currentValues.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Website</label>
                  <input type="text" name="website" value={currentValues.website} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
              </div>
            </div>
          )}

          {/* 2. TAX INFORMATION */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme-text border-b pb-2">Tax Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">GSTIN</label>
                  <input type="text" name="gstin" value={currentValues.gstin} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">PAN</label>
                  <input type="text" name="pan" value={currentValues.pan} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Default GST Registration State</label>
                  <input type="text" name="defaultGstState" value={currentValues.defaultGstState} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Default State Code</label>
                  <input type="text" name="defaultGstStateCode" value={currentValues.defaultGstStateCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
              </div>
            </div>
          )}

          {/* 3. INVOICE SETTINGS */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme-text border-b pb-2">Invoice Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Invoice Prefix</label>
                  <input type="text" name="invoicePrefix" value={currentValues.invoicePrefix} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Proforma Invoice Prefix</label>
                  <input type="text" name="proformaPrefix" value={currentValues.proformaPrefix} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Starting Invoice Number</label>
                  <input type="text" name="startingInvoiceNumber" value={currentValues.startingInvoiceNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Starting Proforma Number</label>
                  <input type="text" name="startingProformaNumber" value={currentValues.startingProformaNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Invoice Number Format</label>
                  <input type="text" name="invoiceNumberFormat" value={currentValues.invoiceNumberFormat} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Default Currency</label>
                  <input type="text" name="defaultCurrency" value={currentValues.defaultCurrency} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-200">Default Payment Terms</label>
                  <textarea name="defaultPaymentTerms" value={currentValues.defaultPaymentTerms} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* 4. FINANCIAL YEAR SETTINGS */}
          {activeTab === 'financial_year' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme-text border-b pb-2">Financial Year Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Current Financial Year</label>
                  <input type="text" name="currentFinancialYear" value={currentValues.currentFinancialYear} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Financial Year Start Month</label>
                  <select name="financialYearStartMonth" value={currentValues.financialYearStartMonth} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2">
                    <option value="January">January</option>
                    <option value="April">April</option>
                    <option value="July">July</option>
                    <option value="October">October</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Financial Year End Month</label>
                  <select name="financialYearEndMonth" value={currentValues.financialYearEndMonth} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2">
                    <option value="December">December</option>
                    <option value="March">March</option>
                    <option value="June">June</option>
                    <option value="September">September</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. BUSINESS PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme-text border-b pb-2">Business Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Default Country</label>
                  <input type="text" name="defaultCountry" value={currentValues.defaultCountry} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Default State</label>
                  <input type="text" name="defaultState" value={currentValues.defaultState} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Date Format</label>
                  <select name="dateFormat" value={currentValues.dateFormat} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Number Format</label>
                  <select name="numberFormat" value={currentValues.numberFormat} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2">
                    <option value="en-IN">Indian (1,00,000.00)</option>
                    <option value="en-US">US/International (100,000.00)</option>
                    <option value="de-DE">European (100.000,00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 6. INVOICE DISPLAY SETTINGS */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-theme-text border-b pb-2">Invoice Display Settings</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Business Logo (URL)</label>
                  <input type="text" name="businessLogo" value={currentValues.businessLogo} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" placeholder="https://example.com/logo.png" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Invoice Header Text</label>
                  <textarea name="invoiceHeader" value={currentValues.invoiceHeader} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Invoice Footer Text</label>
                  <textarea name="invoiceFooter" value={currentValues.invoiceFooter} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Terms and Conditions</label>
                  <textarea name="termsAndConditions" value={currentValues.termsAndConditions} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Bank Details</label>
                  <textarea name="bankDetails" value={currentValues.bankDetails} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" placeholder="Bank Name:&#10;Account No:&#10;IFSC:"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">UPI ID</label>
                  <input type="text" name="upiId" value={currentValues.upiId} onChange={handleChange} className="mt-1 block w-full rounded-md border-theme-border shadow-sm focus:border-theme-primary focus:ring-theme-primary sm:text-sm border p-2" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-theme-border flex justify-between items-center bg-theme-surface sticky bottom-0">
          <button 
            type="button" 
            onClick={handleReset}
            className="text-theme-text-muted hover:text-red-600 px-4 py-2 text-sm font-medium transition-colors"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-4">
            {isDirty && (
              <button 
                type="button" 
                onClick={() => { setFormValues({}); setIsDirty(false); }}
                className="px-4 py-2 border border-theme-border rounded-md text-sm font-medium text-gray-200 hover:bg-theme-surface-hover transition-colors"
              >
                Cancel Changes
              </button>
            )}
            <button 
              type="button" 
              onClick={handleSave}
              className="bg-theme-primary text-white px-6 py-2 rounded-md hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 transition-colors font-medium shadow-sm disabled:opacity-50"
              disabled={!isDirty}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
