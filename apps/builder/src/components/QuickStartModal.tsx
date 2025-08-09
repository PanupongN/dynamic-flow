import React, { useState } from 'react';
import { X, FileText, Users, MessageSquare, Calendar, Star } from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  nodes: any[];
  category: 'business' | 'personal' | 'marketing';
}

const templates: Template[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    icon: MessageSquare,
    category: 'business',
    nodes: [
      {
        id: 'name',
        type: 'text_input',
        position: { x: 100, y: 100 },
        data: { label: 'What is your name?', required: true },
        connections: [{ targetNodeId: 'email' }]
      },
      {
        id: 'email',
        type: 'email_input',
        position: { x: 100, y: 200 },
        data: { label: 'What is your email address?', required: true },
        connections: [{ targetNodeId: 'message' }]
      },
      {
        id: 'message',
        type: 'text_input',
        position: { x: 100, y: 300 },
        data: { label: 'What would you like to tell us?', required: true },
        connections: [{ targetNodeId: 'thank_you' }]
      },
      {
        id: 'thank_you',
        type: 'thank_you',
        position: { x: 100, y: 400 },
        data: { label: 'Thank you for your message!', description: 'We will get back to you soon.' },
        connections: []
      }
    ]
  },
  {
    id: 'registration-form',
    name: 'Event Registration',
    description: 'Registration form with guest information (like Registration Mhai)',
    icon: Users,
    category: 'business',
    nodes: [
      {
        id: 'contact_info',
        type: 'flow_step',
        position: { x: 100, y: 100 },
        data: {
          label: 'Contact Information',
          description: 'Please provide your contact details',
          required: true,
          questions: [
            { id: 'first_name', type: 'text_input', label: 'First Name', required: true },
            { id: 'last_name', type: 'text_input', label: 'Last Name', required: true },
            { id: 'email', type: 'email_input', label: 'Email', required: true },
            { id: 'phone', type: 'text_input', label: 'Phone', required: true }
          ]
        },
        connections: [{ targetNodeId: 'guest_count' }]
      },
      {
        id: 'guest_count',
        type: 'flow_step',
        position: { x: 100, y: 300 },
        data: {
          label: 'How Many Guests',
          description: 'How many guests will you bring?',
          required: true,
          questions: [
            { id: 'number_of_guests', type: 'number_input', label: 'Number of accompanying guests', required: true, min: 0, max: 10 }
          ]
        },
        connections: [{
          targetNodeId: 'guest_details',
          condition: { field: 'number_of_guests', operator: 'greater_than', value: 0 }
        }]
      },
      {
        id: 'guest_details',
        type: 'flow_step',
        position: { x: 100, y: 500 },
        data: {
          label: 'Guest Information',
          description: 'Please provide details for each guest',
          required: true,
          repeatable: true,
          repeatBasedOn: 'number_of_guests',
          questions: [
            { id: 'guest_first_name', type: 'text_input', label: 'Guest First Name', required: true },
            { id: 'guest_last_name', type: 'text_input', label: 'Guest Last Name', required: true },
            { id: 'relation', type: 'single_choice', label: 'Relationship to you', required: true,
              options: [
                { id: 'spouse', label: 'Spouse', value: 'spouse' },
                { id: 'family', label: 'Family Member', value: 'family' },
                { id: 'friend', label: 'Friend', value: 'friend' },
                { id: 'colleague', label: 'Colleague', value: 'colleague' }
              ]
            }
          ]
        },
        connections: [{ targetNodeId: 'thank_you' }]
      },
      {
        id: 'thank_you',
        type: 'thank_you',
        position: { x: 100, y: 700 },
        data: {
          label: 'Thank You!',
          description: 'Your registration has been submitted successfully. We will contact you soon.'
        },
        connections: []
      }
    ]
  },
  {
    id: 'feedback-form',
    name: 'Customer Feedback',
    description: 'Collect customer feedback with rating and comments',
    icon: Star,
    category: 'business',
    nodes: [
      {
        id: 'rating',
        type: 'single_choice',
        position: { x: 100, y: 100 },
        data: {
          label: 'How would you rate our service?',
          required: true,
          options: [
            { id: 'excellent', label: '⭐⭐⭐⭐⭐ Excellent', value: '5' },
            { id: 'good', label: '⭐⭐⭐⭐ Good', value: '4' },
            { id: 'average', label: '⭐⭐⭐ Average', value: '3' },
            { id: 'poor', label: '⭐⭐ Poor', value: '2' },
            { id: 'terrible', label: '⭐ Terrible', value: '1' }
          ]
        },
        connections: [{ targetNodeId: 'comments' }]
      },
      {
        id: 'comments',
        type: 'text_input',
        position: { x: 100, y: 250 },
        data: { label: 'Please tell us more about your experience', required: false },
        connections: [{ targetNodeId: 'recommend' }]
      },
      {
        id: 'recommend',
        type: 'single_choice',
        position: { x: 100, y: 400 },
        data: {
          label: 'Would you recommend us to others?',
          required: true,
          options: [
            { id: 'yes', label: 'Yes, definitely!', value: 'yes' },
            { id: 'maybe', label: 'Maybe', value: 'maybe' },
            { id: 'no', label: 'No', value: 'no' }
          ]
        },
        connections: [{ targetNodeId: 'thank_you' }]
      },
      {
        id: 'thank_you',
        type: 'thank_you',
        position: { x: 100, y: 550 },
        data: { label: 'Thank you for your feedback!', description: 'Your input helps us improve.' },
        connections: []
      }
    ]
  },
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Create a completely custom flow from scratch',
    icon: FileText,
    category: 'personal',
    nodes: []
  }
];

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFlow: (template?: Template) => void;
}

export function QuickStartModal({ isOpen, onClose, onCreateFlow }: QuickStartModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'personal' | 'marketing'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleCreateFlow = async (template: Template) => {
    try {
      onCreateFlow(template);
      onClose();
    } catch (error) {
      console.error('Failed to create flow from template:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Flow</h2>
            <p className="text-gray-600 text-sm mt-1">Choose a template to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b">
          <div className="flex space-x-2">
            {['all', 'business', 'personal', 'marketing'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <template.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {template.nodes.length} {template.nodes.length === 1 ? 'step' : 'steps'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateFlow(template);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? `Selected: ${selectedTemplate.name}` : 'Select a template to continue'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {selectedTemplate && (
              <button
                onClick={() => handleCreateFlow(selectedTemplate)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Flow
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
