import React from 'react';
import { PropagateLoader } from 'react-spinners';
import { Box } from 'gestalt';

const Loader = ({show}) => (
    show && <Box
        position="fixed"
        dangerouslySetInlineStyle={{
            __style: {
                bottom: 450,
                left: '50%',
                transform: "translateX(-50%)"
            }
        }}>
        <PropagateLoader 
            color="darkorange" 
            size={25}>
        </PropagateLoader>
    </Box>
)

export default Loader;