# Dynamic Flow - Usage Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/dynamic-flow.git
cd dynamic-flow
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development environment**
```bash
npm run dev
```

This will start both API server (port 3001) and Frontend (port 3000).

## 📱 Using the Application

### Dashboard
- **URL**: `http://localhost:3000`
- View all flows and analytics
- Create new flows
- Monitor performance metrics

### Flow Builder
- **URL**: `http://localhost:3000/builder`
- Drag-and-drop interface
- Real-time preview
- Auto-save functionality

## 🔧 Creating Your First Flow

### Step 1: Create New Flow
1. Go to Dashboard
2. Click "Create New Flow"
3. You'll be redirected to the Builder

### Step 2: Build Your Flow
1. **Add Components**: Drag components from the palette
2. **Configure Questions**: Click on nodes to edit properties
3. **Set Conditional Logic**: Configure node connections
4. **Preview**: Click "Preview" to test your flow

### Step 3: Save & Publish
1. **Save**: Click "Save" (auto-saves every 2 seconds)
2. **Publish**: Click "Publish" to make it live
3. **Share**: Copy the form URL or embed code

## 📝 Flow Components

### Input Types
- **Text Input**: Short text responses
- **Email Input**: Email validation
- **Number Input**: Numeric values
- **Single Choice**: Radio buttons
- **Multiple Choice**: Checkboxes
- **Date Picker**: Date selection
- **File Upload**: File attachments

### Advanced Features
- **Conditional Logic**: Show/hide based on responses
- **Repeatable Sections**: Dynamic forms (like guest info)
- **Progress Bar**: Visual completion indicator
- **Custom Themes**: Brand customization

## 🎯 Registration Mhai Example

The platform includes a demo flow based on the Registration Mhai structure:

### Flow Structure
1. **Contact Information** 
   - First Name, Last Name, Email, Phone
2. **How Many People**
   - Number of accompanying guests
3. **Guest Information** (Conditional & Repeatable)
   - Repeats based on number of guests
   - Same fields + relationship

### Key Features Demonstrated
- ✅ Multi-step progression
- ✅ Conditional logic (guests only if > 0)
- ✅ Repeatable sections
- ✅ Progress tracking
- ✅ Form validation

## 📊 Analytics & Monitoring

### Real-time Metrics
- **Total Views**: Form page visits
- **Submissions**: Completed responses
- **Conversion Rate**: Submission/view ratio
- **Response Analytics**: Question completion rates

### Exporting Data
```bash
# Export as JSON
GET /api/responses/flow/{flowId}/export?format=json

# Export as CSV
GET /api/responses/flow/{flowId}/export?format=csv
```

## 🎨 Customization

### Themes
```typescript
const customTheme = {
  colors: {
    primary: '#your-color',
    secondary: '#your-secondary',
    background: '#ffffff',
    text: '#000000'
  },
  typography: {
    fontFamily: 'Your Font',
    fontSize: { small: '14px', medium: '16px', large: '18px' }
  }
};
```

### White-label Configuration
```bash
# Environment variables
VITE_PARTNER_NAME="Your Company"
VITE_BRAND_PRIMARY_COLOR="#3b82f6"
VITE_BRAND_LOGO_URL="https://your-domain.com/logo.png"
VITE_WHITE_LABEL_MODE=true
```

## 🔗 Embedding Forms

### Simple Embed
```html
<iframe 
  src="http://localhost:3000/embed/{flowId}"
  width="100%" 
  height="600"
  frameborder="0">
</iframe>
```

### JavaScript SDK (Future)
```javascript
DynamicFlow.embed('container', {
  flowId: 'your-flow-id',
  theme: { /* custom theme */ },
  onSubmit: (data) => { /* handle submission */ }
});
```

## 🛠️ Development

### API Development
```bash
# API only
npm run api

# API documentation
http://localhost:3001/health
```

### Frontend Development
```bash
# Frontend only
npm run builder

# With hot reload
npm run dev
```

### Testing API
```bash
# Health check
curl http://localhost:3001/health

# Create flow
curl -X POST http://localhost:3001/api/flows \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Form","nodes":[]}'

# Get flows
curl http://localhost:3001/api/flows
```

## 📁 Data Storage

### JSON Files Location
```
apps/api/data/
├── flows.json          # All flows
├── responses.json      # Form submissions  
└── analytics.json      # Usage metrics
```

### Backup Strategy
```bash
# Backup data
cp -r apps/api/data/ backup-$(date +%Y%m%d)/

# Restore data
cp -r backup-20240120/ apps/api/data/
```

## 🚀 Production Deployment

### Build for Production
```bash
# Build all apps
npm run build

# Build specific app
npm run build --workspace=apps/builder
```

### Environment Configuration
```bash
# Production API URL
VITE_API_URL=https://api.your-domain.com

# Analytics
VITE_ENABLE_ANALYTICS=true

# Features
VITE_MAX_FORMS=1000
VITE_MAX_SUBMISSIONS=100000
```

## 🐛 Troubleshooting

### Common Issues

**1. API Not Responding**
- Check if API server is running on port 3001
- Verify `http://localhost:3001/health`
- Check for port conflicts

**2. Flows Not Loading**
- Check browser console for errors
- Verify API connection in Network tab
- Check data files in `apps/api/data/`

**3. Save Not Working**
- Check API server logs
- Verify write permissions on data directory
- Check file system space

**4. Styling Issues**
- Clear browser cache
- Check Tailwind CSS compilation
- Verify theme configuration

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev
```

### Log Files
```bash
# API logs
tail -f apps/api/logs/server.log

# Check system resources
top
df -h
```

## 📞 Support

- **Documentation**: `/docs/`
- **API Reference**: `/docs/API.md`
- **GitHub Issues**: Create an issue for bugs
- **Email**: support@dynamicflow.io

## 🔄 Migration to PostgreSQL

When ready for production database:

1. **Install PostgreSQL dependencies**
2. **Run migration scripts**
3. **Update environment variables**
4. **Test thoroughly**
5. **Deploy with zero downtime**

See `/docs/API.md` for detailed migration guide.
