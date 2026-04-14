import React, { useEffect, useState } from 'react';
import {
  Card,
  List,
  Typography,
  CardActions,
  CardContent,
  Button,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUserContext } from '../context/UserContext';
import { Family as FamilyType } from '@types/Family';

export default function Family({ family }: { family: any }) {
  const { currentUser, token } = useUserContext();
  const [familyData, setFamilyData] = useState<FamilyType | null>(null);

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/families/${family.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) throw new Error('Fehler');
        const data = await response.json();
        setFamilyData(data);
      } catch (err) {
        alert(err);
      }
    };

    if (currentUser) loadFamilies();
  }, [currentUser, token, family.id]);

  return (
    <Card
      sx={{
        width: 300,
        borderRadius: 3,
        boxShadow: 3,
        p: 1,
        m: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {family.name}
        </Typography>

        <Divider sx={{ mb: 1 }} />

        <List dense>
          {familyData?.members.map((member) => (
            <ListItem key={member.id} disablePadding>
              <ListItemText
                primary={member.email}
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} size="small">
          Invite
        </Button>
      </CardActions>
    </Card>
  );
}
