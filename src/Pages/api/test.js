export default async function handler(req, res) {
  console.log('Test API called');
  return res.status(200).json({ message: 'API is working!' });
}