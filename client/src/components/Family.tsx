import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useUserContext } from "../context/UserContext";
import { type Family as FamilyType } from "@appTypes/Family";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function Family({ family }: { family: any }) {
  const authFetch = useAuthFetch();
  const { currentUser, token } = useUserContext();
  const [familyData, setFamilyData] = useState<FamilyType | null>(null);

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const response = await authFetch(`/families/${family.id}`);
        if (!response.ok) throw new Error("Fehler");
        const data = await response.json();
        setFamilyData(data);
      } catch (err) {
        alert(err);
      }
    };

    if (currentUser) loadFamilies();
  }, [currentUser, token, family.id, authFetch]);

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
        <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
          {family.name}
        </Typography>

        <Divider sx={{ mb: 1 }} />

        <List dense>
          {familyData?.members.map((member) => (
            <ListItem key={member.id} disablePadding>
              <ListItemText
                primary={member.email}
                slotProps={{ primary: { sx: { fontSize: 14 } } }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} size="small">
          Invite
        </Button>
      </CardActions>
    </Card>
  );
}
