# Partner Deployment Guide

This guide helps partners deploy Dynamic Flow with their own branding and infrastructure.

## 🏗️ Deployment Options

### 1. SaaS Embedding (Recommended)
- Easiest to implement
- Always up-to-date
- Minimal maintenance

```html
<!-- Simple embed -->
<div id="dynamic-flow-widget"></div>
<script src="https://cdn.dynamicflow.io/embed.js"></script>
<script>
  DynamicFlow.embed('dynamic-flow-widget', {
    flowId: 'your-flow-id',
    theme: {
      colors: {
        primary: '#your-brand-color',
        secondary: '#your-secondary-color'
      }
    },
    width: '100%',
    height: 'auto',
    autoResize: true
  });
</script>
```

### 2. White-label Deployment
- Full control over branding
- Custom domain support
- Enterprise features

#### Environment Variables
```bash
# Branding
VITE_PARTNER_NAME="Your Company"
VITE_BRAND_PRIMARY_COLOR="#3b82f6"
VITE_BRAND_SECONDARY_COLOR="#64748b"
VITE_BRAND_LOGO_URL="https://your-domain.com/logo.png"
VITE_CUSTOM_DOMAIN="forms.your-domain.com"
VITE_WHITE_LABEL_MODE=true

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_INTEGRATIONS=true
VITE_MAX_FORMS=100
VITE_MAX_SUBMISSIONS=10000
```

### 3. Self-hosted Deployment
- Complete control
- On-premise hosting
- Custom modifications allowed

## 🚀 Platform-specific Deployments

### AWS Deployment

#### Prerequisites
- AWS CLI configured
- S3 bucket for hosting
- CloudFront distribution (optional)

```bash
# 1. Build the application
npm run build

# 2. Deploy to S3
aws s3 sync apps/builder/dist s3://your-bucket-name/

# 3. Update CloudFront (if using)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### Docker on ECS
```bash
# Build Docker image
docker build -f config/docker/Dockerfile.builder -t your-org/dynamic-flow-builder .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag your-org/dynamic-flow-builder:latest YOUR_ECR_URI/dynamic-flow-builder:latest
docker push YOUR_ECR_URI/dynamic-flow-builder:latest

# Deploy to ECS
aws ecs update-service --cluster your-cluster --service dynamic-flow-builder --force-new-deployment
```

### Azure Deployment

#### Static Web Apps
```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npm run build
  displayName: 'Build application'

- task: AzureStaticWebApp@0
  inputs:
    app_location: 'apps/builder/dist'
    azure_static_web_apps_api_token: $(AZURE_STATIC_WEB_APPS_TOKEN)
```

### Vercel Deployment

```json
{
  "builds": [
    {
      "src": "apps/builder/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/apps/builder/dist/$1"
    }
  ]
}
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dynamic-flow-builder
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dynamic-flow-builder
  template:
    metadata:
      labels:
        app: dynamic-flow-builder
    spec:
      containers:
      - name: builder
        image: ghcr.io/your-org/dynamic-flow-builder:latest
        ports:
        - containerPort: 80
        env:
        - name: PARTNER_NAME
          valueFrom:
            configMapKeyRef:
              name: partner-config
              key: partner-name
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: dynamic-flow-builder-service
spec:
  selector:
    app: dynamic-flow-builder
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## 🎨 Customization Options

### Theme Customization
```typescript
const customTheme = {
  colors: {
    primary: '#your-primary-color',
    secondary: '#your-secondary-color',
    background: '#ffffff',
    text: '#000000',
    border: '#e5e5e5'
  },
  typography: {
    fontFamily: 'Your Font, sans-serif',
    fontSize: {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
  },
  borderRadius: '8px',
  customCSS: `
    .custom-button {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    }
  `
};
```

### Logo and Branding
```css
/* Custom CSS for white-label */
.navbar-brand {
  background-image: url('https://your-domain.com/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  width: 150px;
  height: 40px;
}

.footer-text::after {
  content: 'Powered by Your Company';
}
```

## 🔧 Integration Options

### Webhook Integration
```javascript
// Configure webhooks for form submissions
const webhookConfig = {
  url: 'https://your-api.com/webhooks/form-submission',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  },
  events: ['form.submitted', 'form.started', 'form.abandoned']
};
```

### API Integration
```javascript
// Custom API endpoints
const apiConfig = {
  baseURL: 'https://your-api.com/v1',
  endpoints: {
    saveResponse: '/forms/{flowId}/responses',
    getFlow: '/flows/{flowId}',
    analytics: '/analytics/flows/{flowId}'
  }
};
```

## 📊 Analytics and Monitoring

### Custom Analytics
```javascript
// Google Analytics integration
gtag('event', 'form_start', {
  'form_id': flowId,
  'partner': partnerName
});

gtag('event', 'form_submit', {
  'form_id': flowId,
  'completion_time': completionTime,
  'partner': partnerName
});
```

### Health Monitoring
```bash
# Health check endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/health

# Metrics endpoint (if enabled)
curl https://your-domain.com/metrics
```

## 🔒 Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.dynamicflow.io;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.dynamicflow.io;">
```

### CORS Configuration
```javascript
// For embed widgets
const corsConfig = {
  origin: [
    'https://your-domain.com',
    'https://partner-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Embed not loading**
   - Check CORS configuration
   - Verify script URL
   - Check browser console for errors

2. **Styling issues**
   - Verify CSS custom properties
   - Check for conflicting styles
   - Test in incognito mode

3. **Form submissions failing**
   - Check webhook URL
   - Verify API credentials
   - Check network connectivity

### Debug Mode
```javascript
// Enable debug mode
DynamicFlow.embed('widget', {
  flowId: 'your-flow-id',
  debug: true // Enables console logging
});
```

## 📞 Support

For technical support and custom deployments:
- Email: partners@dynamicflow.io
- Slack: #partner-support
- Documentation: https://docs.dynamicflow.io

## 📝 License

This deployment guide is provided under the partner agreement terms.
