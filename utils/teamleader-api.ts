const TEAMLEADER_API_URL = 'https://focus.teamleader.eu';

export type TeamleaderCustomer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export async function fetchCustomerById(id: string): Promise<TeamleaderCustomer | null> {
  try {
    const response = await fetch(`/api/teamleader/customer?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new Error('Failed to fetch customer');
  }
} 