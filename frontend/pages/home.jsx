import React from 'react';
import { Button, Card, Image, Typography } from 'antd';


const data1 = [
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 1',
      price: '$20,000',
      location: 'City A',
      condition: 'New',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 2',
      price: '$15,000',
      location: 'City B',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$15,000',
      location: 'City B',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$15,000',
      location: 'City B',
      condition: 'Used',
    },
  ];
  
  const data2 = [
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 3',
      price: '$25,000',
      location: 'City C',
      condition: 'New',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
    {
      image: 'https://fastly.picsum.photos/id/715/200/200.jpg?hmac=eR-80S6YYIV9vV26EYLSVACDM5HWe94Oz2hx0icP5vI',
      model: 'Car Model 4',
      price: '$18,000',
      location: 'City D',
      condition: 'Used',
    },
  ];

const CarList = ({ title, data }) => (
  <div style={{ marginBottom: '24px' }}>
    <Typography.Title level={2}>{title}</Typography.Title>
    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {data.map((car, index) => (
          <Card
            key={`${car.model}-${index}`}
            cover={<Image preview={false} alt={car.model} src={car.image} />}
            hoverable
          >
            <Card.Meta title={car.model} description={car.price} />
            <div>Location: {car.location}</div>
            <div>Condition: {car.condition}</div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const Landing = () => (
  <div>
    <CarList title="Recommended For You" data={data1} />
    <CarList title="Saved By You" data={data2} />
  </div>
);

export default Landing;
