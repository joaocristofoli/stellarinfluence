export interface Creator {
  id: string;
  name: string;
  category: string;
  followers: string;
  engagement: string;
  image: string;
  bio: string;
  platforms: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  stats: {
    totalReach: string;
    avgViews: string;
    campaigns: number;
  };
}

export const creators: Creator[] = [
  {
    id: "1",
    name: "Maria Silva",
    category: "Lifestyle & Fashion",
    followers: "5.2M",
    engagement: "8.5%",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop",
    bio: "Influenciadora de moda e lifestyle com foco em sustentabilidade e estilo de vida consciente. Parceira de marcas premium internacionais.",
    platforms: {
      instagram: "@mariasilva",
      youtube: "Maria Silva Official",
      tiktok: "@maria.silva",
    },
    stats: {
      totalReach: "15M",
      avgViews: "500K",
      campaigns: 120,
    },
  },
  {
    id: "2",
    name: "Pedro Santos",
    category: "Tech & Gaming",
    followers: "8.7M",
    engagement: "12.3%",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
    bio: "Criador de conteúdo tech, reviews de hardware e gameplay. Referência em análises honestas e conteúdo de qualidade.",
    platforms: {
      instagram: "@pedrotech",
      youtube: "Pedro Santos Gaming",
      tiktok: "@pedro.tech",
    },
    stats: {
      totalReach: "25M",
      avgViews: "1.2M",
      campaigns: 85,
    },
  },
  {
    id: "3",
    name: "Ana Costa",
    category: "Beauty & Wellness",
    followers: "6.3M",
    engagement: "10.2%",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop",
    bio: "Especialista em beleza, skincare e bem-estar. Educadora sobre cuidados com a pele e produtos de alta performance.",
    platforms: {
      instagram: "@anacosta.beauty",
      youtube: "Ana Costa Beauty",
      tiktok: "@ana.beauty",
    },
    stats: {
      totalReach: "18M",
      avgViews: "750K",
      campaigns: 150,
    },
  },
  {
    id: "4",
    name: "Carlos Mendes",
    category: "Fitness & Sports",
    followers: "4.8M",
    engagement: "9.8%",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop",
    bio: "Personal trainer e atleta profissional. Inspira milhões com treinos inovadores e transformações reais.",
    platforms: {
      instagram: "@carlosfit",
      youtube: "Carlos Mendes Fitness",
      tiktok: "@carlos.fit",
    },
    stats: {
      totalReach: "12M",
      avgViews: "600K",
      campaigns: 95,
    },
  },
  {
    id: "5",
    name: "Julia Ferreira",
    category: "Travel & Adventure",
    followers: "7.1M",
    engagement: "11.5%",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=800&fit=crop",
    bio: "Aventureira e criadora de conteúdo de viagens. Mostra destinos únicos e experiências autênticas ao redor do mundo.",
    platforms: {
      instagram: "@juliaviaja",
      youtube: "Julia pelo Mundo",
      tiktok: "@julia.travel",
    },
    stats: {
      totalReach: "20M",
      avgViews: "900K",
      campaigns: 110,
    },
  },
  {
    id: "6",
    name: "Lucas Oliveira",
    category: "Food & Culinary",
    followers: "5.5M",
    engagement: "13.7%",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
    bio: "Chef e criador de receitas virais. Democratiza a alta gastronomia com tutoriais acessíveis e criativos.",
    platforms: {
      instagram: "@lucascozinha",
      youtube: "Lucas na Cozinha",
      tiktok: "@lucas.food",
    },
    stats: {
      totalReach: "16M",
      avgViews: "850K",
      campaigns: 130,
    },
  },
];
