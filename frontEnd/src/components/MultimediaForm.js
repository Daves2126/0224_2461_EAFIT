import React, { useState } from 'react';
import axiosInstance from '../utils/AxiosInstance';
import Swal from 'sweetalert2';

const MultimediaForm = ({ id }) => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpeg')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid file type',
        text: 'Only PNG and JPEG images are allowed',
      });
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'No file selected',
        text: 'Please select a valid file',
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('id', id);
    formData.append('email', email);
    formData.append('mimeType', file.type);
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/models/executeMultimediaModel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Swal.fire({
        icon: 'success',
        title: 'Request sent',
        text: `MessageId: ${response.data.messageId}`,
      });
    } catch (error) {
      console.error('Error uploading file', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: 'There was an error uploading the file',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          required
        />
      </div>
      <div>
        <label htmlFor="file">File:</label>
        <input
          type="file"
          id="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          required
        />
      </div>
      {preview && (
        <div>
          <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
        </div>
      )}
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
};

export default MultimediaForm;
