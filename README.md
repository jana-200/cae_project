# 🥬 Terroir & Cie - Plateforme de Produits Locaux

> **Projet Académique 2024-2025** | Groupe n°24 - TechnaSoul

Ce projet vise à moderniser la coopérative **Terroir & Cie** en développant une plateforme web permettant la présentation des produits locaux et la gestion des réservations en ligne (Click & Collect).

---

## 👥 L'Équipe (TechnaSoul)

* **Chahid Assia**
* **Hammouten Asmae**
* **Kamal Gana**
* **Kienge Amélie**
* **Wenke Toussaint Victoria**

---

## 📝 Contexte du Projet

La coopérative belge **Terroir & Cie** vend des produits locaux (fruits, légumes, viandes) mais gérait ses ventes uniquement sur place. Afin d'améliorer l'expérience client et la visibilité des producteurs, cette solution numérique a été conçue pour :

1.  Permettre la **réservation en ligne** des produits.
2.  Gérer les **stocks en temps réel**.
3.  Faciliter la **mise en vente par les producteurs**.
4.  Alléger la charge de travail des **bénévoles**.

---

## 🚀 Fonctionnalités Principales

L'application est segmentée par rôles utilisateurs pour garantir une sécurité et une fluidité optimales.

### 🌍 Pour Tous (Visiteurs)
* Consultation du catalogue produits avec filtres (nom, type).
* Visualisation des détails des produits et horaires du magasin.

### 🛒 Pour les Clients
* **Compte personnel :** Inscription et connexion sécurisée.
* **Réservation :** Ajout de produits au panier (provenant de lots différents) et choix de la date de retrait.
* **Suivi :** Historique des réservations (réservée, récupérée, annulée, abandonnée).
* **Annulation :** Possibilité d'annuler une commande avant récupération.

### 👩‍🌾 Pour les Producteurs
* **Gestion des lots :** Proposition de nouveaux lots de produits à la vente.
* **Suivi :** Tableau de bord des lots en vente et vendus.
* **Notifications :** Réception des validations ou refus des lots par les gestionnaires.

### 📦 Pour les Bénévoles (Magasin)
* **Gestion des retraits :** Validation des commandes récupérées par les clients.
* **Gestion des stocks :** Marquage des commandes non récupérées comme "Abandonnées" et retrait d'unités invendables.

### 📊 Pour les Gestionnaires (Administrateurs)
* **Administration :** Création de comptes pour producteurs et gestionnaires.
* **Validation :** Acceptation ou refus des lots proposés par les producteurs.
* **Tableau de bord :** Statistiques des ventes par mois/année.
* **Paramétrage :** Gestion des types de produits.

---

## ⚙️ Architecture et Données

### Cycle de Vie d'une Réservation (Machine à états)
Le système gère rigoureusement l'état des commandes pour assurer la cohérence du stock :
1.  **Créée :** Le client ajoute des articles au panier.
2.  **Réservée :** Le client valide la commande (stock bloqué).
3.  **Récupérée :** Le client vient chercher sa commande en magasin.
4.  **Annulée :** Le client annule sa commande (remise en stock immédiate).
5.  **Abandonnée :** Le client ne s'est pas présenté 30 min avant la fermeture (remise en stock automatique).

### Modèle de Données (Résumé)
L'application repose sur une base de données relationnelle comprenant les entités principales suivantes :
* **Utilisateurs :** Gestion des rôles (Client, Producteur, Gestionnaire, Bénévole).
* **Produits & Types :** Catalogue de référence.
* **Lots_produits :** Gestion des stocks apportés par les producteurs (avec statut de validation).
* **Réservations & Lignes :** Commandes clients liées aux lots spécifiques.

---

## 🎨 Petit aperçu de l'Interface

L'interface a été pensée pour être fluide et intuitive :
* **Design Responsive :** Adapté au défilement et au contenu.
* **Code Couleur :** Respect de la charte graphique de Terroir & Cie.
* **Feedback Utilisateur :** Notifications claires et pop-ups d'authentification.

![WhatsApp Image 2025-11-24 at 21 23 15_ac58ec43](https://github.com/user-attachments/assets/84055bcd-f477-4341-879f-b16fd4753eac)
![WhatsApp Image 2025-11-24 at 21 23 29_e8533805](https://github.com/user-attachments/assets/9d744d17-bd67-4696-9069-57594b6c4272)
![WhatsApp Image 2025-11-24 at 21 25 14_f727cb4a](https://github.com/user-attachments/assets/ee4aec8c-50b7-4ca2-b943-50210ea66c0b)
![WhatsApp Image 2025-11-24 at 21 25 14_ea8fa4a8](https://github.com/user-attachments/assets/becaf75d-f63e-4206-a85d-aff7d54f9f54)


---


*Ce projet a été réalisé dans le cadre du cours de conception d'applications d'etntreprise - 2024/2025.*
![Note](https://img.shields.io/badge/Note_Finale-17.8%2F20-brightgreen?style=for-the-badge&logo=school)
