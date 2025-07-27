export class CreateIssueDto {
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status?: string;
  role?: string;
}

