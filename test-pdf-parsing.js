// Simple test script to verify PDF parsing functionality
// Run with: node test-pdf-parsing.js

const fs = require('fs');
const path = require('path');

// Mock File class for Node.js testing
class MockFile {
  constructor(buffer, name, type) {
    this.buffer = buffer;
    this.name = name;
    this.type = type;
    this.size = buffer.length;
  }

  async arrayBuffer() {
    return this.buffer.buffer.slice(
      this.buffer.byteOffset,
      this.buffer.byteOffset + this.buffer.byteLength
    );
  }
}

async function testPdfParsing() {
  try {
    // Import the parseDocument function
    const { parseDocument } = require('./src/lib/parseDocument.ts');
    
    console.log('Testing PDF parsing functionality...');
    
    // Create a simple test - you would need to provide a real PDF file
    // For now, let's test the error handling with an invalid file
    const invalidBuffer = Buffer.from('This is not a PDF file');
    const mockFile = new MockFile(invalidBuffer, 'test.pdf', 'application/pdf');
    
    try {
      const result = await parseDocument(mockFile);
      console.log('Unexpected success:', result);
    } catch (error) {
      console.log('Expected error caught:', error.message);
      console.log('✅ Error handling is working correctly');
    }
    
  } catch (error) {
    console.error('Test setup error:', error.message);
    console.log('Note: This test requires TypeScript compilation or ts-node to run properly');
  }
}

console.log('PDF Parsing Test');
console.log('================');
console.log('This test verifies that PDF parsing error handling works correctly.');
console.log('To test with real PDFs, place a PDF file in the project root and modify this script.');
console.log('');

testPdfParsing();
