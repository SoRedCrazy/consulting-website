// db-defaults.js — Contenu par défaut (latin) pour le site
module.exports = {
  settings: {
    siteName: 'AUREA CONSULTING',
    tagline: 'Web & Network Consulting',
    phone: '+33 1 23 45 67 89',
    email: 'contact@aurea-consulting.fr',
    address: '12 Rue de la République, 75001 Paris',
    hours: 'Lun – Ven : 9h00 – 18h00',
    social: { linkedin: '#', twitter: '#', github: '#' }
  },
  hero: {
    badge: 'Consulting Web & Network',
    title: 'Architectura Digitalis',
    subtitle: 'Construimus systemata robusta, performantia et aeterna pro negotio tuo.',
    ctaPrimary: 'Nos Contactare',
    ctaSecondary: 'Servitia Explorare',
    stats: [
      { value: 120, suffix: '+', label: 'Projecta Completa' },
      { value: 98, suffix: '%', label: 'Clientes Satisfacti' },
      { value: 15, suffix: '+', label: 'Anni Experientiae' },
      { value: 24, suffix: '/7', label: 'Supportus Continuus' }
    ]
  },
  about: {
    title: 'Qui Sumus',
    subtitle: 'De societas nostra',
    paragraphs: [
      'Aurea Consulting est societas duo virorum fortium, qui web et network per annos plurimos student et exerceant. Nobis placet architectura simplex et fidelis — sine complicationibus vanis, sed cum qualitate excellenti.',
      'Cura nostra est ut systemata tua semper current, securi sint et celeriter respondeant. A conceptione usque ad operationem, tecum sumus. Omne negotium nobis est opus magnum: parva societas, magna cura.',
      'Fides, transparentia et excellentia sunt columnae nostrae. Clientes nostros non clientes vocamus, sed socios — quia successus tuus est successus noster.'
    ],
    values: [
      { icon: 'shield', title: 'Fides', text: 'Verba nostra sunt pignora. Quod promittimus, perficimus.' },
      { icon: 'bolt', title: 'Celeritas', text: 'Responsa celeriter, solutiones efficaciter, sine mora.' },
      { icon: 'eye', title: 'Transparentia', text: 'Omnia aperta: pretium, progressus, methodus.' },
      { icon: 'star', title: 'Excellentia', text: 'Qualitas maxima in omnibus rebus, a prima ad ultimam.' }
    ]
  },
  services: {
    title: 'Servitia Nostra',
    subtitle: 'Quae tibi offerimus',
    items: [
      { icon: 'globe', title: 'Consulting Web', text: 'Design et constructio situs web modernorum, celerium et responsivorum. A pagina simplici usque ad applicationem complexam.', features: ['Design UX/UI', 'Development Frontend', 'SEO & Performance'] },
      { icon: 'network', title: 'Consulting Network', text: 'Architectura et administratio retium tuarum: LAN, WAN, cloud, securitas. Retia quae numquam cadunt.', features: ['Architecture LAN/WAN', 'Securitas & Firewall', 'Cloud & Hybrid'] },
      { icon: 'server', title: 'Infrastructure', text: 'Servidores, virtualisatio, backup et supervision continua. Infrastructura solida super quam aedificare potes.', features: ['Virtualisation', 'Backup & DR', 'Monitoring 24/7'] },
      { icon: 'shield', title: 'Securitas', text: 'Audit securitatis, protectiones contra attackos, conformitas. Dormies securus quia nos vigilamus.', features: ['Audit & Pentest', 'Firewall & IDS', 'Conformité RGPD'] },
      { icon: 'code', title: 'Development', text: 'Applicationes sur-mesura, API, integrationes. Codis qualitas alta, documentata et durabilis.', features: ['Applications Custom', 'API & Intégrations', 'Maintenance'] },
      { icon: 'chart', title: 'Strategia Digitalis', text: 'Consilium strategicum pro transformatione digitali tua. Via clara, passus certi, resultata visa.', features: ['Audit Digital', 'Roadmap', 'Formation'] }
    ]
  },
  team: {
    title: 'Team Nostrum',
    subtitle: 'Duo viri, una visio',
    intro: 'Societas parva est, sed fortis. Duo socii, complementaria scientia, una passio: technologia quae servit hominibus.',
    members: [
      {
        name: 'Marcus Aurelius',
        role: 'Socius — Architectura Web',
        bio: 'Quindecim anni in constructione systematum digitalium. Marcus curat ut omnis linea codis sit clara, celeris et durabilis. Philosophia eius: simplicitas est ultima sapientia.',
        skills: ['Architecture Web', 'DevOps', 'Cloud Computing'],
        initials: 'MA'
      },
      {
        name: 'Lucius Caecilius',
        role: 'Socius — Network & Securitas',
        bio: 'Per annos plurimos retia magna administravit et defendit. Lucius videt periculum ante quam veniat et viam solvendi ante quam quaeratur. Retia eius numquam dormiunt.',
        skills: ['Network Engineering', 'Cybersecurity', 'Infrastructure'],
        initials: 'LC'
      }
    ]
  },
  contact: {
    title: 'Nos Contactare',
    subtitle: 'Primum passum faciamus',
    text: 'Utrum novum projectum incipere vis, an consilium quaeris? Scribe nobis — intra unum diem laboris respondemus.',
    form: {
      namePlaceholder: 'Nomen tuum',
      emailPlaceholder: 'Email tuum',
      subjectPlaceholder: 'Subiectum',
      messagePlaceholder: 'Mensagis tua...',
      submit: 'Mittere Mensagis',
      success: 'Mensagis missa est! Respondemus cito.',
      error: 'Error: mensagis non missa est.'
    }
  },
  footer: {
    text: '© 2026 Aurea Consulting — Omnia iura reservata.',
    madeWith: 'Factum cum fide et diligentia'
  }
};
