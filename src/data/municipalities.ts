export const CITIES_COORDS = [
  { name: 'MOGI GUACU', label: 'Mogi Guaçu', lat: -22.3688, lng: -46.9427 },
  { name: 'MOGI MIRIM', label: 'Mogi Mirim', lat: -22.4332, lng: -46.9582 },
  { name: 'RIO CLARO', label: 'Rio Claro', lat: -22.4116, lng: -47.5614 },
  { name: 'PENAPOLIS', label: 'Penápolis', lat: -21.4191, lng: -50.0766 },
  { name: 'LONDRINA', label: 'Londrina', lat: -23.3103, lng: -51.1628 },
  { name: 'BARRETOS', label: 'Barretos', lat: -20.5573, lng: -48.5678 },
  { name: 'BERTIOGA', label: 'Bertioga', lat: -23.8504, lng: -46.1387 },
  { name: 'SUMARE', label: 'Sumaré', lat: -22.8223, lng: -47.2675 },
  { name: 'ANAPOLIS', label: 'Anápolis', lat: -16.3267, lng: -48.9528 },
  { name: 'JUNDIAI', label: 'Jundiaí', lat: -23.1857, lng: -46.8978 },
  { name: 'BIRIGUI', label: 'Birigui', lat: -21.2882, lng: -50.3400 },
  { name: 'ATIBAIA', label: 'Atibaia', lat: -23.1180, lng: -46.5501 },
  { name: 'PARANAVAI', label: 'Paranavaí', lat: -23.0785, lng: -52.4607 },
  { name: 'PARA DE MINAS', label: 'Pará de Minas', lat: -19.8601, lng: -44.6047 },
  { name: 'FRANCA', label: 'Franca', lat: -20.5385, lng: -47.3995 },
  { name: 'SANTA BARBARA DOESTE', label: "Santa Bárbara d'Oeste", lat: -22.7554, lng: -47.4144 },
  { name: 'ARARAS', label: 'Araras', lat: -22.3571, lng: -47.3846 },
  { name: 'S CARLOS', label: 'São Carlos', lat: -22.0163, lng: -47.8920 }, // São Carlos
  { name: 'MONGAGUA', label: 'Mongaguá', lat: -24.0934, lng: -46.6200 },
  { name: 'PEREIRA BARRETO', label: 'Pereira Barreto', lat: -20.6387, lng: -51.1093 },
  { name: 'JOINVILLE', label: 'Joinville', lat: -26.3045, lng: -48.8487 },
  { name: 'RIB PRETO', label: 'Ribeirão Preto', lat: -21.1775, lng: -47.8103 }, // Ribeirão Preto
  { name: 'GUARATINGUETA', label: 'Guaratinguetá', lat: -22.8122, lng: -45.1917 },
  { name: 'ILHA SOLTEIRA', label: 'Ilha Solteira', lat: -20.4326, lng: -51.3431 },
  { name: 'ITATIBA', label: 'Itatiba', lat: -23.0064, lng: -46.8375 },
  { name: 'PATOS DE MINAS', label: 'Patos de Minas', lat: -18.5888, lng: -46.5147 },
  { name: 'CATANDUVA', label: 'Catanduva', lat: -21.1352, lng: -48.9742 },
  { name: 'LIMEIRA', label: 'Limeira', lat: -22.5645, lng: -47.4017 },
  { name: 'OSASCO', label: 'Osasco', lat: -23.5329, lng: -46.7915 },
  { name: 'PROMISSAO', label: 'Promissão', lat: -21.5367, lng: -49.8580 },
  { name: 'ITAJUBA', label: 'Itajubá', lat: -22.4253, lng: -45.4528 },
  { name: 'ITUMBIARA', label: 'Itumbiara', lat: -18.4216, lng: -49.2155 },
  { name: 'UBATUBA', label: 'Ubatuba', lat: -23.4332, lng: -45.0834 },
  { name: 'ITAPIRA', label: 'Itapira', lat: -22.4357, lng: -46.8207 },
  { name: 'CAJAMAR', label: 'Cajamar', lat: -23.3541, lng: -46.8833 },
  { name: 'PINDAMONHANGABA', label: 'Pindamonhangaba', lat: -22.9234, lng: -45.4589 },
  { name: 'CUBATAO', label: 'Cubatão', lat: -23.8858, lng: -46.4250 },
  { name: 'ANDRADAS', label: 'Andradas', lat: -22.0658, lng: -46.5683 },
  { name: 'CAPAO BONITO', label: 'Capão Bonito', lat: -24.0063, lng: -48.3494 },
  { name: 'SALTO', label: 'Salto', lat: -23.2006, lng: -47.2882 }
];

export const getCityCoords = (entidadeName: string) => {
  if (!entidadeName) return null;
  const normName = entidadeName.toUpperCase();
  for (const city of CITIES_COORDS) {
    if (normName.includes(city.name)) {
      return city;
    }
  }
  return null;
};
