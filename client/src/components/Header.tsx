import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useUserContext } from '../context/UserContext';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

function Header() {
  const { currentUser } = useUserContext();
  console.log('🚀 ~ Header ~ currentUser:', currentUser);

  const getInitials = (email: string | undefined) => {
    if (!email) return 'User';
    const namePart = email.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };
  return (
    <Stack
      sx={{
        width: '100%',
        bgcolor: 'primary.main',
        color: 'white',
        p: 2,
        mb: 4,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <Typography sx={{ width: 'max-content' }} variant="h4">
        MedAlert
      </Typography>

      <Tooltip title={currentUser?.email}>
        <Avatar
          sx={{ width: 40, height: 40 }}
          children={getInitials(currentUser?.email)}
        />
      </Tooltip>
    </Stack>
  );
}

export default Header;
