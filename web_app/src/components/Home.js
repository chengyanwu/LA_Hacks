import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Paper from 'material-ui/Paper';
import Box from '@mui/material/Box';
import Image from '../assets/background.jpg';





export default class Home extends React.Component{
  render(){
      return(
        <div>
          
  <Typography mt={40} align = "center" variant = "h1" style={{top : '1000px'}}>
            WELCOME TO SPOTON
          </Typography>
        </div>
          
      )
  }
}

