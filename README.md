# S1M Customer Requirements Form

A web-based form system for collecting customer requirements when setting up new websites in the S1M platform. This replaces the traditional Word document workflow with a modern, user-friendly web interface.

## Features

### 📝 **Customer Requirements Form** (`index.html`)
- **Comprehensive form** that captures all customer requirements
- **Dynamic field management** for manuscript types and additional questions
- **URL validation** with real-time feedback and preview
- **Required field indicators** with clear visual cues
- **Professional styling** with responsive design
- **Form validation** to ensure data quality

### 🛠️ **Admin Console** (`admin.html`)
- **Submission management** with searchable table view
- **Lightbox editor** for reviewing and editing submissions
- **Data persistence** using localStorage
- **Real-time editing** with unsaved changes detection
- **Debug tools** for troubleshooting

## Form Sections

1. **Journal Information** - Name and URL configuration
2. **Editorial Workflow** - Three standard workflow options
3. **Manuscript Types** - Dynamic list with add/remove functionality
4. **Peer Review Process** - Single or double anonymized
5. **Standard Author Questions** - Checkbox table for including/excluding questions
6. **Additional Questions** - Custom questions with dynamic management
7. **Default User Role** - Author, Reviewer, or both
8. **Additional Information** - Free-form text area

## Key Features

### Dynamic Field Management
- **Add/Remove** manuscript types and additional questions
- **Smart numbering** that automatically updates when items are removed
- **Minimum field enforcement** (keeps at least 2 fields)

### URL Validation
- **Real-time validation** of URL suffix requirements
- **Character restrictions** (alphanumeric only, 18 char max)
- **Visual feedback** with error/warning/success states
- **Live preview** of generated URL

### Data Management
- **localStorage integration** for data persistence
- **JSON data format** for easy processing
- **Form reset** after successful submission
- **Debug tools** for troubleshooting data issues

## Usage

### For End Users
1. Open `index.html` in a web browser
2. Fill out the required fields (marked with red asterisk *)
3. Add manuscript types and additional questions as needed
4. Review standard author questions and check desired options
5. Submit the form

### For Administrators
1. Open `admin.html` to view all submissions
2. Click any row in the table to edit a submission
3. Make changes in the lightbox editor
4. Save changes or close without saving
5. Use debug tools if needed

## Technical Details

- **Pure HTML/CSS/JavaScript** - No external dependencies
- **Responsive design** - Works on desktop and mobile
- **Browser compatibility** - Modern browsers with localStorage support
- **Data format** - JSON with structured fields and arrays

## File Structure

```
customer-requirements-form/
├── index.html          # Main customer form
├── admin.html          # Admin console for viewing submissions
├── extract_fields.py   # Utility script for analyzing Word documents
└── README.md          # This documentation
```

## Getting Started

1. **Clone or download** this repository
2. **Open `index.html`** in a web browser to access the form
3. **Open `admin.html`** to view and manage submissions
4. **No server required** - runs entirely in the browser

## Browser Requirements

- Modern web browser with JavaScript enabled
- localStorage support for data persistence
- Recommended: Chrome, Firefox, Safari, Edge (latest versions)

## Future Enhancements

- Backend integration for server-side data storage
- User authentication and access control
- Email notifications for new submissions
- Export functionality (PDF, CSV)
- Advanced search and filtering in admin console
- Integration with existing S1M platform APIs

## Support

For questions or issues, please contact the development team or create an issue in the repository.