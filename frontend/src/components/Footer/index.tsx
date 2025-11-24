import { Box, Typography, useTheme } from '@mui/material';
import { Copyright } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.primary.light
            : theme.palette.primary.dark,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography>
        <Copyright data-testid="CopyrightIcon" />
        By TechnaSoul
      </Typography>
    </Box>
  );
};

export default Footer;
