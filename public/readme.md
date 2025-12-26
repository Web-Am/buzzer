# 🎮 Fanta Buzzer

Webapp di quiz multiplayer in tempo reale con sistema di punteggio strategico.

## 🚀 Features

- ⚡ **Realtime**: Sincronizzazione istantanea via Firebase Realtime Database
- 👥 **Multiplayer**: Supporto per stanze private con codici univoci
- 🎯 **Sistema Punti**: Gestione strategica del budget per massimizzare vittorie
- 📱 **Responsive**: UI ottimizzata per desktop e mobile
- 🎨 **Modern UI**: Design Web3.0 con Tailwind CSS e Framer Motion
- ♿ **Accessibile**: Supporto screen reader e navigazione da tastiera

## 📋 Prerequisiti

- Node.js 18+
- Account Firebase con Realtime Database
- npm o yarn

## ⚙️ Installazione
```bash
# Clone repository
git clone https://github.com/your-repo/fanta-buzzer.git
cd fanta-buzzer

# Installa dipendenze
npm install

# Configura Firebase
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Firebase

# Avvia dev server
npm run dev
```

## 🏗️ Struttura Progetto
```
fanta-buzzer/
├── app/                    # Next.js App Router pages
├── components/             # Componenti React
│   ├── ui/                # Componenti UI riusabili
│   ├── master/            # Componenti Master
│   ├── slave/             # Componenti Slave
│   └── shared/            # Componenti condivisi
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── lib/                   # Utility e configurazioni
├── types/                 # TypeScript types
└── public/                # Asset statici
```

## 🎮 Come Giocare

### Master (Creatore Stanza)
1. Vai su `/register`
2. Configura nome, email, punti totali e timer
3. Crea la stanza e condividi il codice
4. Avvia round inserendo domanda e punti massimi
5. Termina round quando desiderato o automaticamente allo scadere del timer

### Slave (Partecipante)
1. Vai su `/join`
2. Inserisci codice stanza, nome e email
3. Attendi l'avvio del round
4. Premi il buzzer per rispondere (costo variabile in base alle press precedenti)
5. Usa mini-buzzer per puntate più alte

## 🔧 Configurazione Firebase

### Realtime Database Rules
```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

### Indexes (opzionali per performance)
```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        "currentRound": {
          "presses": {
            ".indexOn": ["serverTs"]
          }
        }
      }
    }
  }
}
```

## 📊 Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Raccomandato)
```bash
vercel --prod
```

### Docker
```bash
docker build -t fanta-buzzer .
docker run -p 3000:3000 fanta-buzzer
```

## 🐛 Troubleshooting

### Errore: "Stanza non trovata"
- Verifica che il codice stanza sia corretto (6 caratteri uppercase)
- Controlla connessione Firebase

### Buzzer non risponde
- Verifica di avere punti sufficienti
- Controlla di non essere l'ultimo ad aver premuto
- Assicurati che il round sia attivo

### Timer non visibile
- Verifica che `startTs` sia salvato correttamente
- Controlla console per errori Firebase

## 📝 License

MIT License - vedi LICENSE file

## 👥 Contributors

- [Your Name](https://github.com/yourname)

## 🙏 Credits

- Next.js Team
- Firebase Team
- Tailwind CSS
- Framer Motion