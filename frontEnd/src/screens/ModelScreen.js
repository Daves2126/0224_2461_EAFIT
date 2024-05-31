import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/AxiosInstance';
import { Row, Col, Image, ListGroup, Button } from 'react-bootstrap';
import BasicForm from '../components/BasicForm';  // Ensure this path is correct
import MultimediaForm from '../components/MultimediaForm';  // Ensure this path is correct

const ModelScreen = ({ match }) => {
  const [model, setModel] = useState({});
  const [showForm, setShowForm] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const hoverTimeout = useRef(null);

  useEffect(() => {
    const fetchModel = async () => {
      console.log('Requesting model...');
      const { data } = await axiosInstance.get(`/api/models/${match.params.id}`);
      setModel(data);
      setImageSrc(data.image); // Set the initial image source
    };
    fetchModel();
  }, [match]);

  const handleButtonClick = () => {
    console.log("Entre")
    if (model.modelType === 0) {
      setShowForm('BasicForm');
    } else if (model.modelType === 1) {
      setShowForm('MultimediaForm');
    }
  };

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setImageSrc('/images/yui-hirasawa-k-on.gif'); // Change image after 10 seconds
    }, 5000); // 10 seconds delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setImageSrc(model.image); // Reset to the original image
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <Image
            src={imageSrc}
            alt={model.name}
            fluid
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </Col>

        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item><h3>{model.name}</h3></ListGroup.Item>
            <ListGroup.Item>Desarrollado por: {model.author}</ListGroup.Item>
            <ListGroup.Item>Descripción: {model.description}</ListGroup.Item>
            <ListGroup.Item>Estado: {model.status}</ListGroup.Item>
          </ListGroup>
          <Button variant="outline-warning" onClick={handleButtonClick}>
            Ejecutar Modelo
          </Button>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item><strong>Precio:</strong> {model.price}</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      {showForm === 'BasicForm' && <BasicForm id={model.id} />}
      {showForm === 'MultimediaForm' && <MultimediaForm id={model.id} />}
    </>
  );
};

export default ModelScreen;
