export type CategoryPublic = {
  id: number;
  name: string;
};

export type CompanyPublic = {
  id: number;
  name: string;
  nip_krs: string;
  user_id: number;
  address: string | null;
  image_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  categories: CategoryPublic[];
};

export type MeResponse = {
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  company: CompanyPublic | null;
};

export type AnnouncementPublic = {
  id: number;
  company_id: number;
  created_at: string;
  salary_min: string | null;
  salary_max: string | null;
  description: string | null;
  company: {
    id: number;
    name: string;
    nip_krs: string;
    address: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    categories: CategoryPublic[];
  } | null;
};
