import React, { useState } from 'react';
import axiosInstance from '../utils/AxiosInstance';
import Swal from 'sweetalert2';

const BasicForm = ({ id }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      id: id,
      email: email,
    };

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/models/executeModel', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      Swal.fire({
        icon: 'success',
        title: 'Form submitted successfully',
        text: `MessageId: ${response.data.messageId}`,
      });
    } catch (error) {
      console.error('Error submitting form', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: 'There was an error submitting the form',
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
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
};

export default BasicForm;
