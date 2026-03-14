// Translation system for todoless-ngx app
// Add new languages by adding a new key to the translations object

export type Language = 'en' | 'nl' | 'fr' | 'de';

export const translations = {
  en: {
    // App Name
    appName: 'todoless-ngx',
    
    // Navigation
    inbox: 'Inbox',
    tasks: 'Tasks',
    items: 'Items',
    notes: 'Notes',
    calendar: 'Calendar',
    settings: 'Settings',
    
    // Common Actions
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    create: 'Create',
    update: 'Update',
    
    // Task Management
    newTask: 'New task',
    searchTasks: 'Search tasks or add new...',
    noTasks: 'No tasks yet',
    taskPlaceholder: 'Start working on your goals',
    priority: 'Priority',
    dueDate: 'Due Date',
    assignee: 'Assignee',
    labels: 'Labels',
    blocker: 'Blocker',
    sprint: 'Sprint',
    convertToItem: 'Convert to Item',
    makePrivate: 'Make Private',
    makePublic: 'Make Public',
    pinToTop: 'Pin to top',
    unpin: 'Unpin',
    
    // Priority Levels
    urgent: 'Urgent',
    normal: 'Normal',
    low: 'Low',
    
    // Task Status
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
    checkedOut: 'Checked Out',
    checkInAll: 'Check In All',
    uncheckAll: 'Uncheck All',
    
    // Items
    newItem: 'New item',
    searchItems: 'Search items or add new...',
    noItems: 'No items yet',
    itemPlaceholder: 'Track things you need',
    quantity: 'Quantity',
    shop: 'Shop',
    restock: 'Restock',
    convertToTask: 'Convert to Task',
    
    // Notes
    newNote: 'New note',
    searchNotes: 'Search notes or add new...',
    noNotes: 'No notes yet',
    notePlaceholder: 'Notes are for reflection and context',
    writeNote: 'Write your note here...',
    
    // Calendar
    week: 'Week',
    today: 'Today',
    
    // Inbox
    inboxTitle: 'Quick Overview',
    totalTasks: 'Total Tasks',
    completedTasks: 'Completed',
    activeTasks: 'Active',
    urgentTasks: 'Urgent',
    myTasks: 'My Tasks',
    unassigned: 'Unassigned',
    viewAll: 'View All',
    
    // Settings
    yourProfile: 'Your Profile',
    role: 'Role',
    changeRole: 'Change Role',
    password: 'Password',
    changePassword: 'Change password',
    newPassword: 'New password',
    members: 'Members',
    teamMembers: 'Team Members',
    inviteCodes: 'Invite Codes',
    inviteMember: 'Invite Team Member',
    onlyAdmins: 'Only administrators can invite new users. Contact your admin to get access.',
    adminsCantChangeRole: 'Admin users cannot change their own role',
    
    // Labels
    addLabel: 'Add Label',
    labelName: 'Label Name',
    color: 'Color',
    privateLabel: 'Private Label',
    
    // Shops
    shops: 'Shops',
    addShop: 'Add Shop',
    shopName: 'Shop Name',
    
    // Filters
    filters: 'Filters',
    addFilter: 'Add Filter',
    filterName: 'Filter Name',
    
    // Sprints
    sprints: 'Sprints',
    newSprint: 'New Sprint',
    currentSprint: 'Current Sprint',
    allSprints: 'All Sprints',
    noActiveSprint: 'No active sprint. Create one to assign tasks.',
    completedTasksReady: 'completed tasks ready to archive',
    cleanUp: 'Clean Up',
    deleteSprint: 'Delete sprint',
    
    // Archive
    archive: 'Archive',
    retentionPeriod: 'Retention Period',
    days30: '30 days',
    days60: '60 days',
    days90: '90 days',
    unlimited: 'Unlimited',
    archivedTasks: 'archived tasks',
    tasksWithoutDate: 'tasks without archive date',
    archiveAllDone: 'Archive All Completed Tasks',
    deleteAllArchived: 'Delete All Archived Tasks',
    retentionUnlimited: 'Archived tasks will never be automatically deleted',
    retentionDays: 'Archived tasks will be automatically deleted after',
    
    // Integrations
    integrations: 'Integrations',
    
    // Bulk Import
    bulkImport: 'Bulk Import',
    
    // Logout
    logout: 'Log Out',
    
    // Roles
    admin: 'Admin',
    user: 'User',
    child: 'Child',
    
    // Messages
    notLoggedIn: 'Not logged in',
    
    // Invite System
    generateCode: 'Generate Invite Code',
    inviteCode: 'Invite Code',
    expiresIn: 'Expires in',
    shareViaWhatsApp: 'Share via WhatsApp',
    copyCode: 'Copy Code',
    codeCopied: 'Code copied!',
    activeInvites: 'Active Invites',
    noActiveInvites: 'No active invites',
    usesRemaining: 'uses remaining',
    deleteCode: 'Delete code',
    
    // Archive Messages
    archiveConfirm: 'Archive completed tasks from',
    archiveQuestion: 'This will permanently delete them.',
    tasksArchived: 'tasks archived from',
    archiveAllConfirm: 'Archive',
    completedTasksQuestion: 'completed tasks?',
    deleteArchivedConfirm: 'Permanently delete',
    archivedTasksQuestion: 'archived tasks? This cannot be undone.',
    archivedTasksDeleted: 'archived tasks deleted',
    
    // Time
    hours: 'hours',
    minutes: 'minutes',
    
    // Filter Live Preview
    livePreview: 'Live Preview',
    matchingTasks: 'matching tasks',
    matchingItems: 'matching items',
    matchingNotes: 'matching notes',
  },
  nl: {
    // App Name
    appName: 'todoless-ngx',
    
    // Navigation
    inbox: 'Inbox',
    tasks: 'Taken',
    items: 'Items',
    notes: 'Notities',
    calendar: 'Kalender',
    settings: 'Instellingen',
    
    // Common Actions
    add: 'Toevoegen',
    edit: 'Bewerken',
    delete: 'Verwijderen',
    cancel: 'Annuleren',
    save: 'Opslaan',
    close: 'Sluiten',
    search: 'Zoeken',
    filter: 'Filter',
    sort: 'Sorteren',
    create: 'Aanmaken',
    update: 'Bijwerken',
    
    // Task Management
    newTask: 'Nieuwe taak',
    searchTasks: 'Zoek taken of voeg nieuwe toe...',
    noTasks: 'Nog geen taken',
    taskPlaceholder: 'Begin met werken aan je doelen',
    priority: 'Prioriteit',
    dueDate: 'Deadline',
    assignee: 'Toegewezen aan',
    labels: 'Labels',
    blocker: 'Blokkade',
    sprint: 'Sprint',
    convertToItem: 'Converteer naar Item',
    makePrivate: 'Privé maken',
    makePublic: 'Openbaar maken',
    pinToTop: 'Vastpinnen',
    unpin: 'Losmaken',
    
    // Priority Levels
    urgent: 'Urgent',
    normal: 'Normaal',
    low: 'Laag',
    
    // Task Status
    todo: 'Te doen',
    inProgress: 'Bezig',
    done: 'Klaar',
    checkedOut: 'Uitgevinkt',
    checkInAll: 'Alles Terugzetten',
    uncheckAll: 'Alles Uitvinken',
    
    // Items
    newItem: 'Nieuw item',
    searchItems: 'Zoek items of voeg nieuwe toe...',
    noItems: 'Nog geen items',
    itemPlaceholder: 'Houd bij wat je nodig hebt',
    quantity: 'Aantal',
    shop: 'Winkel',
    restock: 'Hervullen',
    convertToTask: 'Converteer naar Taak',
    
    // Notes
    newNote: 'Nieuwe notitie',
    searchNotes: 'Zoek notities of voeg nieuwe toe...',
    noNotes: 'Nog geen notities',
    notePlaceholder: 'Notities zijn voor reflectie en context',
    writeNote: 'Schrijf je notitie hier...',
    
    // Calendar
    week: 'Week',
    today: 'Vandaag',
    
    // Inbox
    inboxTitle: 'Snel Overzicht',
    totalTasks: 'Totaal Taken',
    completedTasks: 'Voltooid',
    activeTasks: 'Actief',
    urgentTasks: 'Urgent',
    myTasks: 'Mijn Taken',
    unassigned: 'Niet toegewezen',
    viewAll: 'Bekijk Alles',
    
    // Settings
    yourProfile: 'Jouw Profiel',
    role: 'Rol',
    changeRole: 'Rol Wijzigen',
    password: 'Wachtwoord',
    changePassword: 'Wachtwoord wijzigen',
    newPassword: 'Nieuw wachtwoord',
    members: 'Leden',
    teamMembers: 'Teamleden',
    inviteCodes: 'Uitnodigingscodes',
    inviteMember: 'Nodig Teamlid Uit',
    onlyAdmins: 'Alleen beheerders kunnen nieuwe gebruikers uitnodigen. Neem contact op met je beheerder.',
    adminsCantChangeRole: 'Beheerders kunnen hun eigen rol niet wijzigen',
    
    // Labels
    addLabel: 'Label Toevoegen',
    labelName: 'Label Naam',
    color: 'Kleur',
    privateLabel: 'Privé Label',
    
    // Shops
    shops: 'Winkels',
    addShop: 'Winkel Toevoegen',
    shopName: 'Winkel Naam',
    
    // Filters
    filters: 'Filters',
    addFilter: 'Filter Toevoegen',
    filterName: 'Filter Naam',
    
    // Sprints
    sprints: 'Sprints',
    newSprint: 'Nieuwe Sprint',
    currentSprint: 'Huidige Sprint',
    allSprints: 'Alle Sprints',
    noActiveSprint: 'Geen actieve sprint. Maak er een aan om taken toe te wijzen.',
    completedTasksReady: 'voltooide taken klaar om te archiveren',
    cleanUp: 'Opruimen',
    deleteSprint: 'Sprint verwijderen',
    
    // Archive
    archive: 'Archief',
    retentionPeriod: 'Bewaartermijn',
    days30: '30 dagen',
    days60: '60 dagen',
    days90: '90 dagen',
    unlimited: 'Onbeperkt',
    archivedTasks: 'gearchiveerde taken',
    tasksWithoutDate: 'taken zonder archiefdatum',
    archiveAllDone: 'Archiveer Alle Voltooide Taken',
    deleteAllArchived: 'Verwijder Alle Gearchiveerde Taken',
    retentionUnlimited: 'Gearchiveerde taken worden nooit automatisch verwijderd',
    retentionDays: 'Gearchiveerde taken worden automatisch verwijderd na',
    
    // Integrations
    integrations: 'Integraties',
    
    // Bulk Import
    bulkImport: 'Bulk Import',
    
    // Logout
    logout: 'Uitloggen',
    
    // Roles
    admin: 'Beheerder',
    user: 'Gebruiker',
    child: 'Kind',
    
    // Messages
    notLoggedIn: 'Niet ingelogd',
    
    // Invite System
    generateCode: 'Genereer Uitnodigingscode',
    inviteCode: 'Uitnodigingscode',
    expiresIn: 'Verloopt over',
    shareViaWhatsApp: 'Deel via WhatsApp',
    copyCode: 'Kopieer Code',
    codeCopied: 'Code gekopieerd!',
    activeInvites: 'Actieve Uitnodigingen',
    noActiveInvites: 'Geen actieve uitnodigingen',
    usesRemaining: 'keer over',
    deleteCode: 'Code verwijderen',
    
    // Archive Messages
    archiveConfirm: 'Archiveer voltooide taken van',
    archiveQuestion: 'Dit verwijdert ze permanent.',
    tasksArchived: 'taken gearchiveerd van',
    archiveAllConfirm: 'Archiveer',
    completedTasksQuestion: 'voltooide taken?',
    deleteArchivedConfirm: 'Permanent verwijderen',
    archivedTasksQuestion: 'gearchiveerde taken? Dit kan niet ongedaan worden gemaakt.',
    archivedTasksDeleted: 'gearchiveerde taken verwijderd',
    
    // Time
    hours: 'uur',
    minutes: 'minuten',
    
    // Filter Live Preview
    livePreview: 'Live Voorvertoning',
    matchingTasks: 'overeenkomende taken',
    matchingItems: 'overeenkomende items',
    matchingNotes: 'overeenkomende notities',
  },
  fr: {
    // App Name
    appName: 'todoless-ngx',
    
    // Navigation
    inbox: 'Boîte de réception',
    tasks: 'Tâches',
    items: 'Articles',
    notes: 'Notes',
    calendar: 'Calendrier',
    settings: 'Paramètres',
    
    // Common Actions
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    close: 'Fermer',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    create: 'Créer',
    update: 'Mettre à jour',
    
    // Task Management
    newTask: 'Nouvelle tâche',
    searchTasks: 'Rechercher des tâches ou en ajouter...',
    noTasks: 'Aucune tâche',
    taskPlaceholder: 'Commencez à travailler sur vos objectifs',
    priority: 'Priorité',
    dueDate: 'Date limite',
    assignee: 'Assigné à',
    labels: 'Étiquettes',
    blocker: 'Bloqueur',
    sprint: 'Sprint',
    convertToItem: 'Convertir en Article',
    makePrivate: 'Rendre Privé',
    makePublic: 'Rendre Public',
    pinToTop: 'Épingler',
    unpin: 'Désépingler',
    
    // Priority Levels
    urgent: 'Urgent',
    normal: 'Normal',
    low: 'Faible',
    
    // Task Status
    todo: 'À faire',
    inProgress: 'En cours',
    done: 'Terminé',
    checkedOut: 'Décoché',
    checkInAll: 'Tout Recocher',
    uncheckAll: 'Tout Décocher',
    
    // Items
    newItem: 'Nouvel article',
    searchItems: 'Rechercher des articles ou en ajouter...',
    noItems: 'Aucun article',
    itemPlaceholder: 'Suivez ce dont vous avez besoin',
    quantity: 'Quantité',
    shop: 'Magasin',
    restock: 'Réapprovisionner',
    convertToTask: 'Convertir en Tâche',
    
    // Notes
    newNote: 'Nouvelle note',
    searchNotes: 'Rechercher des notes ou en ajouter...',
    noNotes: 'Aucune note',
    notePlaceholder: 'Les notes sont pour la réflexion et le contexte',
    writeNote: 'Écrivez votre note ici...',
    
    // Calendar
    week: 'Semaine',
    today: 'Aujourd\'hui',
    
    // Inbox
    inboxTitle: 'Aperçu Rapide',
    totalTasks: 'Total des Tâches',
    completedTasks: 'Terminées',
    activeTasks: 'Actives',
    urgentTasks: 'Urgentes',
    myTasks: 'Mes Tâches',
    unassigned: 'Non assignées',
    viewAll: 'Voir Tout',
    
    // Settings
    yourProfile: 'Votre Profil',
    role: 'Rôle',
    changeRole: 'Changer de Rôle',
    password: 'Mot de passe',
    changePassword: 'Changer le mot de passe',
    newPassword: 'Nouveau mot de passe',
    members: 'Membres',
    teamMembers: 'Membres de l\'Équipe',
    inviteCodes: 'Codes d\'Invitation',
    inviteMember: 'Inviter un Membre',
    onlyAdmins: 'Seuls les administrateurs peuvent inviter de nouveaux utilisateurs.',
    adminsCantChangeRole: 'Les administrateurs ne peuvent pas changer leur propre rôle',
    
    // Labels
    addLabel: 'Ajouter une Étiquette',
    labelName: 'Nom de l\'Étiquette',
    color: 'Couleur',
    privateLabel: 'Étiquette Privée',
    
    // Shops
    shops: 'Magasins',
    addShop: 'Ajouter un Magasin',
    shopName: 'Nom du Magasin',
    
    // Filters
    filters: 'Filtres',
    addFilter: 'Ajouter un Filtre',
    filterName: 'Nom du Filtre',
    
    // Sprints
    sprints: 'Sprints',
    newSprint: 'Nouveau Sprint',
    currentSprint: 'Sprint Actuel',
    allSprints: 'Tous les Sprints',
    noActiveSprint: 'Aucun sprint actif. Créez-en un pour assigner des tâches.',
    completedTasksReady: 'tâches terminées prêtes à archiver',
    cleanUp: 'Nettoyer',
    deleteSprint: 'Supprimer le sprint',
    
    // Archive
    archive: 'Archive',
    retentionPeriod: 'Période de Rétention',
    days30: '30 jours',
    days60: '60 jours',
    days90: '90 jours',
    unlimited: 'Illimité',
    archivedTasks: 'tâches archivées',
    tasksWithoutDate: 'tâches sans date d\'archive',
    archiveAllDone: 'Archiver Toutes les Tâches Terminées',
    deleteAllArchived: 'Supprimer Toutes les Tâches Archivées',
    retentionUnlimited: 'Les tâches archivées ne seront jamais supprimées automatiquement',
    retentionDays: 'Les tâches archivées seront automatiquement supprimées après',
    
    // Integrations
    integrations: 'Intégrations',
    
    // Bulk Import
    bulkImport: 'Import en Masse',
    
    // Logout
    logout: 'Se Déconnecter',
    
    // Roles
    admin: 'Administrateur',
    user: 'Utilisateur',
    child: 'Enfant',
    
    // Messages
    notLoggedIn: 'Non connecté',
    
    // Invite System
    generateCode: 'Générer un Code d\'Invitation',
    inviteCode: 'Code d\'Invitation',
    expiresIn: 'Expire dans',
    shareViaWhatsApp: 'Partager via WhatsApp',
    copyCode: 'Copier le Code',
    codeCopied: 'Code copié!',
    activeInvites: 'Invitations Actives',
    noActiveInvites: 'Aucune invitation active',
    usesRemaining: 'utilisations restantes',
    deleteCode: 'Supprimer le code',
    
    // Archive Messages
    archiveConfirm: 'Archiver les tâches terminées de',
    archiveQuestion: 'Cela les supprimera définitivement.',
    tasksArchived: 'tâches archivées de',
    archiveAllConfirm: 'Archiver',
    completedTasksQuestion: 'tâches terminées?',
    deleteArchivedConfirm: 'Supprimer définitivement',
    archivedTasksQuestion: 'tâches archivées? Cette action est irréversible.',
    archivedTasksDeleted: 'tâches archivées supprimées',
    
    // Time
    hours: 'heures',
    minutes: 'minutes',
    
    // Filter Live Preview
    livePreview: 'Aperçu en Direct',
    matchingTasks: 'tâches correspondantes',
    matchingItems: 'articles correspondants',
    matchingNotes: 'notes correspondantes',
  },
  de: {
    // App Name
    appName: 'todoless-ngx',
    
    // Navigation
    inbox: 'Posteingang',
    tasks: 'Aufgaben',
    items: 'Artikel',
    notes: 'Notizen',
    calendar: 'Kalender',
    settings: 'Einstellungen',
    
    // Common Actions
    add: 'Hinzufügen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    close: 'Schließen',
    search: 'Suchen',
    filter: 'Filtern',
    sort: 'Sortieren',
    create: 'Erstellen',
    update: 'Aktualisieren',
    
    // Task Management
    newTask: 'Neue Aufgabe',
    searchTasks: 'Aufgaben suchen oder hinzufügen...',
    noTasks: 'Keine Aufgaben',
    taskPlaceholder: 'Beginnen Sie mit Ihren Zielen',
    priority: 'Priorität',
    dueDate: 'Fälligkeitsdatum',
    assignee: 'Zugewiesen an',
    labels: 'Labels',
    blocker: 'Blocker',
    sprint: 'Sprint',
    convertToItem: 'In Artikel umwandeln',
    makePrivate: 'Privat machen',
    makePublic: 'Öffentlich machen',
    pinToTop: 'Anpinnen',
    unpin: 'Loslösen',
    
    // Priority Levels
    urgent: 'Dringend',
    normal: 'Normal',
    low: 'Niedrig',
    
    // Task Status
    todo: 'Zu erledigen',
    inProgress: 'In Bearbeitung',
    done: 'Erledigt',
    checkedOut: 'Abgehakt',
    checkInAll: 'Alles Zurücksetzen',
    uncheckAll: 'Alles Abhaken',
    
    // Items
    newItem: 'Neuer Artikel',
    searchItems: 'Artikel suchen oder hinzufügen...',
    noItems: 'Keine Artikel',
    itemPlaceholder: 'Verfolgen Sie, was Sie brauchen',
    quantity: 'Menge',
    shop: 'Geschäft',
    restock: 'Nachfüllen',
    convertToTask: 'In Aufgabe umwandeln',
    
    // Notes
    newNote: 'Neue Notiz',
    searchNotes: 'Notizen suchen oder hinzufügen...',
    noNotes: 'Keine Notizen',
    notePlaceholder: 'Notizen sind für Reflexion und Kontext',
    writeNote: 'Schreiben Sie Ihre Notiz hier...',
    
    // Calendar
    week: 'Woche',
    today: 'Heute',
    
    // Inbox
    inboxTitle: 'Schnellübersicht',
    totalTasks: 'Gesamt Aufgaben',
    completedTasks: 'Erledigt',
    activeTasks: 'Aktiv',
    urgentTasks: 'Dringend',
    myTasks: 'Meine Aufgaben',
    unassigned: 'Nicht zugewiesen',
    viewAll: 'Alle Anzeigen',
    
    // Settings
    yourProfile: 'Ihr Profil',
    role: 'Rolle',
    changeRole: 'Rolle Ändern',
    password: 'Passwort',
    changePassword: 'Passwort ändern',
    newPassword: 'Neues Passwort',
    members: 'Mitglieder',
    teamMembers: 'Teammitglieder',
    inviteCodes: 'Einladungscodes',
    inviteMember: 'Mitglied Einladen',
    onlyAdmins: 'Nur Administratoren können neue Benutzer einladen.',
    adminsCantChangeRole: 'Administratoren können ihre eigene Rolle nicht ändern',
    
    // Labels
    addLabel: 'Label Hinzufügen',
    labelName: 'Label-Name',
    color: 'Farbe',
    privateLabel: 'Privates Label',
    
    // Shops
    shops: 'Geschäfte',
    addShop: 'Geschäft Hinzufügen',
    shopName: 'Geschäftsname',
    
    // Filters
    filters: 'Filter',
    addFilter: 'Filter Hinzufügen',
    filterName: 'Filter-Name',
    
    // Sprints
    sprints: 'Sprints',
    newSprint: 'Neuer Sprint',
    currentSprint: 'Aktueller Sprint',
    allSprints: 'Alle Sprints',
    noActiveSprint: 'Kein aktiver Sprint. Erstellen Sie einen, um Aufgaben zuzuweisen.',
    completedTasksReady: 'erledigte Aufgaben bereit zum Archivieren',
    cleanUp: 'Aufräumen',
    deleteSprint: 'Sprint löschen',
    
    // Archive
    archive: 'Archiv',
    retentionPeriod: 'Aufbewahrungsfrist',
    days30: '30 Tage',
    days60: '60 Tage',
    days90: '90 Tage',
    unlimited: 'Unbegrenzt',
    archivedTasks: 'archivierte Aufgaben',
    tasksWithoutDate: 'Aufgaben ohne Archivdatum',
    archiveAllDone: 'Alle Erledigten Aufgaben Archivieren',
    deleteAllArchived: 'Alle Archivierten Aufgaben Löschen',
    retentionUnlimited: 'Archivierte Aufgaben werden niemals automatisch gelöscht',
    retentionDays: 'Archivierte Aufgaben werden automatisch gelöscht nach',
    
    // Integrations
    integrations: 'Integrationen',
    
    // Bulk Import
    bulkImport: 'Massenimport',
    
    // Logout
    logout: 'Abmelden',
    
    // Roles
    admin: 'Administrator',
    user: 'Benutzer',
    child: 'Kind',
    
    // Messages
    notLoggedIn: 'Nicht angemeldet',
    
    // Invite System
    generateCode: 'Einladungscode Generieren',
    inviteCode: 'Einladungscode',
    expiresIn: 'Läuft ab in',
    shareViaWhatsApp: 'Via WhatsApp Teilen',
    copyCode: 'Code Kopieren',
    codeCopied: 'Code kopiert!',
    activeInvites: 'Aktive Einladungen',
    noActiveInvites: 'Keine aktiven Einladungen',
    usesRemaining: 'verbleibende Verwendungen',
    deleteCode: 'Code löschen',
    
    // Archive Messages
    archiveConfirm: 'Erledigte Aufgaben archivieren von',
    archiveQuestion: 'Dies wird sie dauerhaft löschen.',
    tasksArchived: 'Aufgaben archiviert von',
    archiveAllConfirm: 'Archivieren',
    completedTasksQuestion: 'erledigte Aufgaben?',
    deleteArchivedConfirm: 'Dauerhaft löschen',
    archivedTasksQuestion: 'archivierte Aufgaben? Dies kann nicht rückgängig gemacht werden.',
    archivedTasksDeleted: 'archivierte Aufgaben gelöscht',
    
    // Time
    hours: 'Stunden',
    minutes: 'Minuten',
    
    // Filter Live Preview
    livePreview: 'Live-Vorschau',
    matchingTasks: 'übereinstimmende Aufgaben',
    matchingItems: 'übereinstimmende Artikel',
    matchingNotes: 'übereinstimmende Notizen',
  }
};

export type TranslationKey = keyof typeof translations.en;