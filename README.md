# Airtable Integration Tool

A full-stack web application that provides a complete interface for managing Airtable data through CRUD operations. Built with React/TypeScript frontend and Express.js backend.

## Features

- **Dynamic Table Management**: Works with any Airtable base and table
- **Complete CRUD Operations**: Create, read, update, and delete records
- **Smart Field Filtering**: Automatically filters out computed and read-only fields
- **Intelligent File Uploads**: Auto-detects attachment fields and prioritizes image fields
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type-Safe**: Full TypeScript implementation with Zod validation

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Airtable account with API access

## Local Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd airtable-integration-tool

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database (optional - uses in-memory storage by default)
DATABASE_URL=postgresql://username:password@localhost:5432/airtable_app

# Development settings
NODE_ENV=development
PORT=5000
```

### 3. Get Your Airtable Credentials

#### API Key
1. Go to [Airtable Account](https://airtable.com/account)
2. Generate a personal access token
3. Copy the token (starts with `pat...`)

#### Base ID
1. Open your Airtable base
2. Go to Help > API Documentation
3. Find your Base ID in the URL or documentation
4. Copy the Base ID (starts with `app...`)

#### Table Name
- Use the exact table name as it appears in Airtable
- Case-sensitive (e.g., "Bugs", "Comments", "Users")

### 4. Run the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage Guide

### 1. Configure Airtable Connection

1. Open the application in your browser
2. Enter your Airtable credentials:
   - **API Key**: Your personal access token
   - **Base ID**: Your Airtable base identifier  
   - **Table Name**: The table you want to manage
3. Click "Save Configuration"

### 2. Managing Records

#### View Records
- All records are displayed in a table format
- Computed fields are automatically hidden
- Click "Refresh" to reload data

#### Create New Records
1. Click "Add Record" button
2. Fill in the form (only editable fields are shown)
3. Click "Save" to create the record

#### Edit Records
1. Click the "Edit" button on any record
2. Modify the fields in the form
3. Click "Save Changes"

#### Delete Records
1. Click the "Delete" button on any record
2. Confirm the deletion in the dialog

#### Upload Files
1. Click the "Upload" button on any record
2. Select or drag-and-drop your file
3. Files automatically go to image/attachment fields
4. Supported formats: PNG, JPG, PDF (up to 10MB)

### 3. Switching Between Tables

1. Click "Change Table" in the header
2. Enter a new table name
3. The interface will automatically adapt to the new table's schema

## Architecture

### Frontend (`client/`)
- **React 18** with TypeScript and Vite
- **shadcn/ui** components built on Radix UI
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **React Hook Form** with Zod validation
- **Wouter** for routing

### Backend (`server/`)
- **Express.js** with TypeScript
- **Airtable API** integration
- **In-memory storage** for configuration
- **Zod schemas** for validation
- **CORS enabled** for development

### Key Files
- `server/routes.ts` - API endpoints for Airtable operations
- `client/src/components/airtable-config.tsx` - Configuration form
- `client/src/components/records-table.tsx` - Main data table
- `client/src/components/record-form.tsx` - Create/edit forms
- `client/src/components/upload-modal.tsx` - File upload interface
- `shared/schema.ts` - Shared TypeScript types

## Advanced Features

### Smart Field Filtering

The application automatically detects and filters out:
- **Computed fields**: Formulas, lookups, rollups
- **AI-generated fields**: Sentiment analysis, classifications
- **System fields**: Created time, modified time
- **Status fields**: Auto-calculated status indicators

### Intelligent Upload System

File uploads automatically detect and prioritize:
1. **Image fields**: Screenshots, Photos, Images, Pictures
2. **General attachment fields**: Attachments, Files, Documents
3. **Custom fields**: Any field containing "upload", "file", etc.

### Error Handling

- **422 Errors**: Prevented by filtering computed fields
- **Field Validation**: Client-side validation before API calls
- **Network Errors**: Graceful error messages and retry options
- **File Uploads**: Size and format validation

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Database migrations (if using PostgreSQL)
npm run db:migrate
```

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and hooks
│   │   └── App.tsx         # Main app component
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # TypeScript definitions
└── package.json            # Dependencies and scripts
```

### API Endpoints

- `GET /api/airtable/config` - Get current configuration
- `POST /api/airtable/config` - Save configuration
- `GET /api/airtable/:table` - Get all records
- `POST /api/airtable/:table` - Create new record
- `PATCH /api/airtable/:table/:id` - Update record
- `DELETE /api/airtable/:table/:id` - Delete record
- `POST /api/airtable/:table/:id/attachment/:field` - Upload file

## Troubleshooting

### Common Issues

**"Field is computed" errors**
- Solution: The app automatically filters these out. Refresh the page if you see this error.

**"Unknown field name" errors**
- Solution: Check that your table name matches exactly (case-sensitive)

**Upload failures**
- Solution: Ensure your table has attachment fields (Screenshots, Photos, etc.)

**Connection issues**
- Solution: Verify your API key and Base ID are correct

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Airtable API documentation
3. Open an issue in the repository