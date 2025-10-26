import axios from 'axios';

// Get these from your Pinata account
//const PINATA_API_KEYPINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
//const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY || '';
const PINATA_JWT = (import.meta as any).env.VITE_PINATA_JWT || '';

// Upload JSON data to Pinata
export const pinJSONToIPFS = async (data: any) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataMetadata: {
  name: `carbon-project-${data.projectId}-${Date.now()}.json`,
},

        pinataContent: data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error);
    throw error;
  }
};

// Upload file to Pinata
export const pinFileToIPFS = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        maxBodyLength: Infinity,
      }
    );
    
    return {
  cid: response.data.IpfsHash,
  size: response.data.PinSize,
  timestamp: response.data.Timestamp,
};
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw error;
  }
};