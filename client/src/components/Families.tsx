import React from 'react';
import { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { Family as FamilyType } from '@types/Family';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Family from './Family';

function Families() {
  const { currentUser, token } = useUserContext();

  const [families, setFamilies] = useState<FamilyType[]>([]);

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const response = await fetch(`http://localhost:3000/families`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Fehler:');
        }
        const data = await response.json();
        setFamilies(data);
      } catch (err) {
        alert(err);
      }
    };
    if (currentUser) {
      loadFamilies();
    }
  }, [currentUser, token]);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="body1" color="initial">
        Families members
      </Typography>
      <List sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        {families?.map((family) => {
          return <Family key={family.id} family={family} />;
        })}
      </List>
    </Box>
  );
}

export default Families;
