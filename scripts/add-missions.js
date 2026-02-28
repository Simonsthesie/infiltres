const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'data', 'missions.json');
const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const newMissions = [
  { category: "Cible Précise (Manipulation)", text: "Le Vexé Imaginaire : Fais semblant d'être profondément offensé par une remarque totalement banale de [CIBLE]. Exige un shooter d'excuses pour te calmer." },
  { category: "Cible Précise (Manipulation)", text: "L'Amnésique : Appelle [CIBLE] par un faux prénom très éloigné du sien pendant 10 minutes. S'il/elle te corrige, propose-lui un cul-sec pour te faire pardonner." },
  { category: "Cible Précise (Manipulation)", text: "Le Commercial MLM : Essaie de vendre un produit pyramidal imaginaire (ex: des huiles essentielles à la saucisse) à [CIBLE]. Ne lâche pas l'affaire pendant 3 minutes." },
  { category: "Cible Précise (Manipulation)", text: "Le Thérapeute Sauvage : Interromps [CIBLE] pour lui dire : 'C'est exactement ce que mon psy m'a dit de ne plus faire'. Refuse d'en dire plus." },
  { category: "Cible Précise (Manipulation)", text: "Le Râteau Temporel : Fais un 'check' ou un 'high-five' à [CIBLE], mais retire ta main au tout dernier moment. Recommence jusqu'à ce qu'il/elle s'énerve." },
  { category: "Cible Précise (Manipulation)", text: "Le Médium de Comptoir : Lis l'avenir dans le fond du verre de [CIBLE]. Prédis-lui une catastrophe imminente s'il/elle ne finit pas son verre tout de suite." },
  { category: "Cible Précise (Manipulation)", text: "L'Expert en Orthophonie : Reprends [CIBLE] sur la prononciation d'un mot très courant en insistant sur le fait qu'il/elle le dit mal depuis sa naissance." },
  { category: "Cible Précise (Manipulation)", text: "La Phobie Partagée : Confie à [CIBLE] que tu as une peur panique d'un truc absurde (ex: les cotons-tiges ou les poignées de porte) et demande-lui s'il/elle aussi." },
  { category: "Cible Précise (Manipulation)", text: "Le Mauvais Public : Baille de manière très exagérée et bruyante à chaque fois que [CIBLE] commence à raconter une anecdote." },
  { category: "Cible Précise (Manipulation)", text: "Le Cinéphile Menteur : Convaincs [CIBLE] que tu n'as jamais entendu parler d'un film extrêmement culte (genre Titanic ou Le Roi Lion) et demande-lui de te raconter l'histoire." },
  { category: "Absurde & Malaisant", text: "Le Fétichiste des Coudes : Complimente longuement et sérieusement la forme des coudes de [CIBLE]." },
  { category: "Absurde & Malaisant", text: "Le Troisième Œil : Fixe intensément le front de [CIBLE] au lieu de ses yeux pendant toute une conversation. Ne réponds pas s'il/elle te demande ce que tu regardes." },
  { category: "Absurde & Malaisant", text: "Le Dégustateur de Vide : Prends le verre vide de [CIBLE], fais semblant d'en boire une gorgée, claque la langue et dis 'Excellent millésime'." },
  { category: "Absurde & Malaisant", text: "Le Paranormal : Demande à [CIBLE] s'il/elle croit aux fantômes, puis regarde fixement par-dessus son épaule avec un visage terrifié." },
  { category: "Absurde & Malaisant", text: "L'Aura Beige : Dis très sérieusement à [CIBLE] que son aura est 'agressivement beige ce soir' et propose-lui un shooter pour y remédier." },
  { category: "Absurde & Malaisant", text: "Le Nourrisseur : Réussis à donner à manger un truc (chips, cacahuète) à [CIBLE] directement à la main, comme à un animal de compagnie." },
  { category: "Absurde & Malaisant", text: "Le Clap de Fin : Lance un 'slow clap' (applaudissement lent) totalement hors de propos quand [CIBLE] finit une phrase banale." },
  { category: "Absurde & Malaisant", text: "Le Secret Médical : Demande l'avis de [CIBLE] sur un problème médical inventé et extrêmement gênant, avec beaucoup trop de détails." },
  { category: "Absurde & Malaisant", text: "Le Vœu de Silence : Déclare soudainement à [CIBLE] que tu entames un vœu de silence de 3 minutes. Communique uniquement par des gestes dramatiques." },
  { category: "Absurde & Malaisant", text: "Le Polyglotte Imaginaire : Réponds à [CIBLE] en utilisant une langue totalement inventée, avec l'intonation parfaite, pendant 1 minute." },
  { category: "Infiltration & Vice", text: "Le Post-it Humain : Réussis à coller un morceau de scotch ou un bout de papier dans le dos de [CIBLE] sans te faire choper." },
  { category: "Infiltration & Vice", text: "Le Sabotage de Lacet : Réussis à défaire discrètement une des chaussures de [CIBLE]." },
  { category: "Infiltration & Vice", text: "Le Rapprochement Tactique : Rapproche-toi physiquement de [CIBLE] centimètre par centimètre jusqu'à être malaisamment proche, sans qu'il/elle te repousse." },
  { category: "Infiltration & Vice", text: "L'Écho Déformé : Copie exactement le rire de [CIBLE] à chaque fois qu'il/elle rit, mais avec une demi-seconde de retard." },
  { category: "Infiltration & Vice", text: "L'Otage : Glisse discrètement le téléphone de [CIBLE] dans ta poche et attends qu'il/elle le cherche pour l'aider à le retrouver sous un coussin." },
  { category: "Infiltration & Vice", text: "Le Switch de Verre : Ajoute discrètement de l'eau dans le verre d'alcool de [CIBLE] quand il/elle a le dos tourné." },
  { category: "Infiltration & Vice", text: "Le Réveil Matin : Penche-toi vers [CIBLE], murmure-lui 'Réveille-toi, tu es dans le coma' et éloigne-toi immédiatement." },
  { category: "Infiltration & Vice", text: "Le Crieur de Nuit : Va dans une autre pièce, lâche un petit cri aigu, reviens et demande innocemment à [CIBLE] s'il/elle a entendu un truc bizarre." },
  { category: "Infiltration & Vice", text: "L'Arroseur Discret : Fais tomber 'par accident' quelques gouttes de ton verre sur les chaussures de [CIBLE] et accuse quelqu'un d'autre de t'avoir poussé." },
  { category: "Infiltration & Vice", text: "Le Passager Clandestin : Assieds-toi sur le même siège/canapé que [CIBLE] alors qu'il y a très peu de place, et force-le/la à se décaler doucement." },
  { category: "Défis Physiques & Malus", text: "Le Sportif de Salon : Commence à faire des étirements intenses (cuisses, bras) en plein milieu d'une conversation avec [CIBLE], comme si de rien n'était." },
  { category: "Défis Physiques & Malus", text: "La Bataille de Pouces : Défie [CIBLE] à une bataille de pouces. Si tu gagnes, tu lui imposes de finir son verre. Si tu perds, tu bois." },
  { category: "Défis Physiques & Malus", text: "Le Check Complexe : Invente un 'check' de main ridiculement long et complexe (au moins 5 étapes). Force [CIBLE] à l'apprendre et à le refaire sans erreur, sinon il/elle boit." },
  { category: "Défis Physiques & Malus", text: "L'Épreuve de Force : Défie [CIBLE] de te porter sur son dos ou dans ses bras. S'il/elle refuse ou n'y arrive pas, il/elle prend un shooter." },
  { category: "Défis Physiques & Malus", text: "L'Imitateur : Reproduis exactement la posture corporelle de [CIBLE] (bras croisés, jambe tendue). Change à chaque fois qu'il/elle bouge, pendant 5 minutes." },
  { category: "Défis Physiques & Malus", text: "Le Cul-Sec Aveugle : Lance un défi à [CIBLE] : boire un demi-verre les yeux fermés. Remplace son verre par un autre liquide inoffensif mais surprenant (ex: lait, jus de citron) juste avant." },
  { category: "Défis Physiques & Malus", text: "La Danse de la Joie : Chaque fois que [CIBLE] finit une phrase, fais une mini-danse de 2 secondes en guise de célébration." },
  { category: "Défis Physiques & Malus", text: "L'Hydratation Forcée : Amène un grand verre d'eau à [CIBLE] et reste à côté d'il/elle en le/la fixant jusqu'à ce qu'il/elle l'ait fini entièrement." },
  { category: "Défis Physiques & Malus", text: "Le Compte à Rebours : Approche-toi de [CIBLE] et compte à voix haute de 10 à 0 en le/la regardant dans les yeux. À 0, fais un bruit d'explosion et pars." },
  { category: "Défis Physiques & Malus", text: "Le Chifoumi de l'Espace : Lance un chifoumi avec [CIBLE] mais invente un quatrième signe (ex: 'le trou noir') et explique avec aplomb pourquoi il bat sa pierre." },
  { category: "Hardcore & Chaos", text: "L'Échange de Chaussures : Convaincs [CIBLE] d'échanger une de ses chaussures avec toi pendant 15 minutes pour 'des raisons d'équilibre d'énergies'." },
  { category: "Hardcore & Chaos", text: "Le Chantage Affectif : Dis à [CIBLE] : 'Si tu ne bois pas ce shooter avec moi, ça veut dire que notre amitié est une illusion.' Fais les gros yeux tristes." },
  { category: "Hardcore & Chaos", text: "Le Sommelier Hostile : Renifle violemment le verre de [CIBLE], crie 'C'est bouchonné !' et verse-en un peu par terre (ou dans l'évier) avant de lui rendre." },
  { category: "Hardcore & Chaos", text: "L'Intervieweur Invasif : Prends un objet (bouteille, banane) comme micro et interviewe [CIBLE] sur sa vie sexuelle ou ses pires hontes devant tout le monde." },
  { category: "Hardcore & Chaos", text: "Le Paranoïaque : Prends [CIBLE] à part et dis-lui très sérieusement que tu soupçonnes un autre invité d'être un flic en civil." },
  { category: "Hardcore & Chaos", text: "Le Complotiste des Toilettes : Explique à [CIBLE] qu'il y a une règle tacite ce soir : on ne peut aller aux toilettes qu'en binôme. Force-le/la à t'accompagner (jusqu'à la porte)." },
  { category: "Hardcore & Chaos", text: "Le Gourou : Demande à [CIBLE] de fermer les yeux, de respirer un grand coup et de boire son shooter pour 'purifier son karma'." },
  { category: "Hardcore & Chaos", text: "L'Inspecteur des Travaux Finis : Dès que [CIBLE] sort des toilettes, va vérifier (ou fais semblant) et sors en disant : 'Wow... T'as pas honte ?' assez fort." },
  { category: "Hardcore & Chaos", text: "Le Troc Injuste : Échange de force ton verre presque vide contre le verre plein de [CIBLE] en affirmant que c'est la loi de la jungle." },
  { category: "Hardcore & Chaos", text: "Le Sauveur Non Sollicité : Attrape [CIBLE] par les épaules, secoue-le/la légèrement et crie 'Ne t'inquiète pas, je vais te sortir de là !' en le/la tirant vers une autre pièce." }
];

current.push(...newMissions);
fs.writeFileSync(filePath, JSON.stringify(current));
console.log('Missions ajoutées:', newMissions.length, '— Total:', current.length);
