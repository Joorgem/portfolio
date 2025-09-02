# How to Edit Portfolio Data

This directory contains all dynamic portfolio data in JSON format.

## File Structure

- **projects.json** - Your projects and work
- **experiences.json** - Your professional experiences
- **reviews.json** - Testimonials and reviews
- **socials.json** - Social media links

## How to Edit

### 1. Editing Projects (projects.json)

To add a new project, copy the existing structure:

```json
{
  "id": 7,  // Unique ID, increment the last one
  "title": "Project Name",
  "description": "Brief project description",
  "subDescription": [
    "Detail 1 of what was done",
    "Detail 2 of what was implemented",
    "Technologies used"
  ],
  "href": "https://project-link.com",  // External link (optional)
  "logo": "",  // Project logo (optional)
  "image": "/assets/projects/image-name.jpg",  // Project image
  "tags": [
    {
      "id": 1,
      "name": "React",
      "path": "/assets/logos/react.svg"  // Technology logo
    }
  ]
}
```

### 2. Editing Experiences (experiences.json)

```json
{
  "title": "Position",
  "job": "Company or Project Type",
  "date": "2024-2025",
  "contents": [
    "Responsibility or achievement 1",
    "Responsibility or achievement 2",
    "Technologies used"
  ]
}
```

### 3. Editing Reviews (reviews.json)

```json
{
  "name": "Person Name",
  "username": "@username",
  "body": "Testimonial about your work",
  "img": "https://photo-url.com/photo.jpg"
}
```

### 4. Editing Social Media (socials.json)

```json
{
  "name": "Social Network Name",
  "href": "https://your-profile-link.com",
  "icon": "/assets/socials/icon.svg"
}
```

## Important Tips

1. **Always maintain valid JSON structure**
   - Use commas between items (except the last one)
   - Keep double quotes
   - Don't leave trailing commas

2. **Unique IDs**
   - Each project must have a unique ID
   - Increment based on the last ID used

3. **Images**
   - Place images in `/public/assets/projects/`
   - Use relative paths starting with `/assets/`

4. **Validation**
   - After editing, test locally with `npm run dev`
   - Check browser console for errors

5. **Backup**
   - Always commit changes to Git
   - Keep a backup before major changes

## Example Editing Flow

1. Open the desired JSON file in VS Code
2. Make your changes following the structure
3. Save the file (Ctrl+S)
4. Test with `npm run dev`
5. If everything is ok, commit:
   ```bash
   git add .
   git commit -m "Update projects/experiences"
   ```

## Useful Tools

- **VS Code** - Recommended editor
- **JSON Validator** - jsonlint.com to validate JSON
- **Prettier** - For automatic formatting