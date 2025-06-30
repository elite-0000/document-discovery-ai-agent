# PDF Parsing Troubleshooting Guide

## Common PDF Parsing Issues and Solutions

### 1. **Environment Setup Issues**

**Problem**: Missing environment variables
**Solution**: 
1. Copy `.env.example` to `.env.local`
2. Fill in your OpenAI API key and Supabase credentials
3. Restart your development server

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
npm run dev
```

### 2. **PDF-Specific Issues**

#### **Issue**: "Failed to parse PDF" error
**Possible Causes & Solutions**:

- **Password-protected PDFs**: Remove password protection or use a different PDF
- **Corrupted PDF files**: Try with a different PDF file
- **Scanned PDFs (images only)**: Use OCR tools to convert to text-based PDF first
- **Very large PDFs**: Split into smaller files (current limit: 50MB)
- **Complex formatting**: Try saving the PDF in a simpler format

#### **Issue**: "PDF appears to be empty"
**Solutions**:
- Check if the PDF contains actual text (not just images)
- Try copying text from the PDF manually to verify it has extractable text
- For image-based PDFs, use OCR software first

#### **Issue**: Memory errors with large PDFs
**Solutions**:
- Reduce PDF file size
- Split large documents into smaller chunks
- Increase Node.js memory limit: `node --max-old-space-size=4096`

### 3. **Network and API Issues**

#### **Issue**: OpenAI API errors
**Solutions**:
- Verify your OpenAI API key is correct and has sufficient credits
- Check OpenAI service status: https://status.openai.com/
- Ensure you have access to the embedding model (`text-embedding-3-small`)

#### **Issue**: Supabase connection errors
**Solutions**:
- Verify Supabase URL and keys are correct
- Check if your Supabase project is active
- Ensure the `embeddings` table exists with proper schema

### 4. **Development Environment Issues**

#### **Issue**: TypeScript compilation errors
**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### **Issue**: Package dependency conflicts
**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 5. **Testing Your Setup**

#### **Quick Test Steps**:

1. **Test with a simple PDF**:
   - Create a simple PDF with just text (no images/complex formatting)
   - Try uploading through the interface

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed API calls

3. **Check server logs**:
   - Look at your terminal running `npm run dev`
   - Check for detailed error messages

#### **Test PDF Creation**:
Create a simple test PDF:
1. Open a text editor
2. Type: "This is a test document for PDF parsing."
3. Save as PDF
4. Try uploading this simple file

### 6. **Debugging Steps**

1. **Enable detailed logging**:
   - Check the console logs in your browser
   - Look at the terminal running your dev server

2. **Test API endpoints directly**:
   ```bash
   # Test the ingest endpoint with curl
   curl -X POST http://localhost:3000/api/ingest \
     -F "file=@your-test-file.pdf"
   ```

3. **Verify file upload**:
   - Check that files are being received by the server
   - Verify file size and type are correct

### 7. **Alternative Solutions**

If PDF parsing continues to fail:

1. **Convert PDF to other formats**:
   - Export PDF as DOCX from your PDF reader
   - Use online PDF to text converters

2. **Use different PDF libraries**:
   - The codebase has both `pdf-parse` and `PDFLoader` from LangChain
   - Try switching between them if one fails

3. **Manual text extraction**:
   - Copy text from PDF manually
   - Save as .txt file and upload instead

### 8. **Getting Help**

If issues persist:

1. **Check the specific error message** in browser console and server logs
2. **Try with different PDF files** to isolate the issue
3. **Verify all environment variables** are set correctly
4. **Test with the simplest possible PDF** first

### 9. **Recent Improvements Made**

The following improvements have been implemented:

- ✅ Added comprehensive error handling in API routes
- ✅ Improved PDF parsing with better error messages
- ✅ Added file validation (type, size)
- ✅ Enhanced user feedback with detailed error messages
- ✅ Added loading states and success confirmations
- ✅ Implemented proper logging for debugging

### 10. **Next Steps**

If you're still experiencing issues, please:

1. Share the specific error message you're seeing
2. Mention what type of PDF you're trying to upload
3. Check if the issue occurs with all PDFs or just specific ones
4. Verify your environment setup is complete
