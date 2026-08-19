UPDATE messages 
SET subject = 'Document Uploaded — Under Review',
    message = REPLACE(message, 'was verified.', 'has been uploaded successfully and is under review by admin.')
WHERE subject = 'Document Uploaded & Verified';
