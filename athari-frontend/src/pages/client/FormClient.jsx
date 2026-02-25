import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Container, Box, Grid, TextField,
  Button, Stepper, Step, StepLabel, Select, MenuItem, InputLabel,
  FormControl, Typography, Divider, Paper, FormHelperText, Snackbar, Alert,
  IconButton, Autocomplete
} from "@mui/material";
import { indigo, blueGrey, cyan } from "@mui/material/colors";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiClient from "../../services/api/ApiClient";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Layout from "../../components/layout/Layout";
import {
  Upload as UploadIcon,
  Close
} from "@mui/icons-material";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: indigo[700] },
    secondary: { main: cyan.A700 },
    background: { default: blueGrey[50] },
  },
  shape: { borderRadius: 12 },
});

const ETAPES = [
  "Identité & Agence",
  "Localisation & Contact",
  "Documents & Profession",
  "Famille & Biens",
  "Documents CNI & NUI"
];

const schemas = [
  Yup.object({
    agency_id: Yup.string().required("L'agence est obligatoire"),
    nom_prenoms: Yup.string().required("Le nom est obligatoire"),
    sexe: Yup.string().required("Le sexe est obligatoire"),
    date_naissance: Yup.string().required("La date de naissance est obligatoire"),
    lieu_naissance: Yup.string(),
    nationalite: Yup.string(),
  }),
  Yup.object({
    adresse_ville: Yup.string().required("La ville est obligatoire"),
    adresse_quartier: Yup.string().required("Le quartier est obligatoire"),
    telephone: Yup.string().required("Le téléphone est obligatoire"),
    photo_localisation_domicile: Yup.mixed(),
    ville_activite: Yup.string(),
    quartier_activite: Yup.string(),
    lieu_dit_activite: Yup.string(),
    photo_localisation_activite: Yup.mixed(),
    lieu_dit_domicile: Yup.string(),
    email: Yup.string(),
    bp: Yup.string(),
    pays_residence: Yup.string(),
  }),
  Yup.object({
    cni_numero: Yup.string(),
    profession: Yup.string(),
    nui: Yup.string(),
    photo: Yup.mixed(),
    signature: Yup.mixed(),
    cni_delivrance: Yup.string(),
    cni_expiration: Yup.string(),
    employeur: Yup.string(),
  }),
  Yup.object({}),
  Yup.object({}),
];

const DONNEES_VILLES = {
  Douala: ["Akwa", "Bonapriso", "Deïdo", "Bali", "Makepe", "Bonanjo", "Logbessou", "Kotto", "Logpom", "Lendi", "Nyalla", "Ndogpassi", "Bepanda", "Bonamoussadi", "Ange Raphaël", "Ndoti", "New Bell", "Bassa", "Nylon", "Cité des Palmiers", "Bonabéri", "Sodiko", "Boanda", "Mabanda", "Yassa", "Japoma"],
  
  Yaoundé: [
    // ============ YAOUNDÉ 1er ============
    "Bastos (Résidentiel, Ambassades)",
    "Bastos - Carrefour Bastos",
    "Bastos - Quartier Fouda",
    
    "Mvog-Mbi (Grand Marché)",
    "Mvog-Mbi - Carrefour Mvog-Mbi",
    "Mvog-Mbi - Marché Mvog-Mbi",
    "Mvog-Mbi - Église",
    "Mvog-Mbi - Chemin de Fer",
    
    "Mvog-Ada",
    "Mvog-Ada - Carrefour Mvog-Ada",
    "Mvog-Ada - Poste",
    
    "Nlongkak",
    "Nlongkak - Carrefour Nlongkak",
    "Nlongkak - Pharmacie",
    "Nlongkak - Total",
    
    "Elig-Essono",
    "Elig-Essono - Ministères",
    "Elig-Essono - Carrefour Elig-Essono",
    
    "Santa Barbara",
    "Santa Barbara - Résidentiel",
    "Santa Barbara - Carrefour",
    
    "Etoa-Meki",
    "Etoa-Meki - Carrefour",
    "Etoa-Meki - École",
    
    "Messa",
    "Messa - Carrefour Messa",
    "Messa - Station",
    
    "Hippodrome",
    "Hippodrome - Piste",
    
    "Mont-Fébé",
    "Mont-Fébé - Sommet",
    "Mont-Fébé - Hôtel",
    "Mont-Fébé - Résidences",
    
    "Djoungolo",
    "Mfoundi",
    "Olezoa",
    "Olezoa - Lac",
    
    // ============ YAOUNDÉ 2e ============
    "Tsinga",
    "Tsinga - Carrefour Tsinga",
    "Tsinga - Mairie",
    "Tsinga - Montée",
    
    "Fouda",
    "Fouda - Résidentiel",
    "Fouda - Carrefour",
    
    "Warda",
    "Warda - Marché",
    "Warda - Carrefour",
    
    "Ngoa-Ekéllé",
    "Ngoa-Ekéllé - Université",
    "Ngoa-Ekéllé - Campus",
    "Ngoa-Ekéllé - Restaurant Universitaire",
    "Ngoa-Ekéllé - Bibliothèque",
    "Ngoa-Ekéllé - Cité U",
    
    "Melen",
    "Melen - Cité Verte",
    "Melen - Carrefour Melen",
    "Melen - Université",
    
    "Carrière",
    "Carrière - Avenue Kennedy",
    "Carrière - Marché Carrière",
    "Carrière - Chefferie",
    
    "Mvog-Betsi",
    "Mvog-Betsi - Hôpital",
    "Mvog-Betsi - Carrefour",
    
    "Nkomkana",
    "Nkomkana - Carrefour",
    
    "Nkol-Eton",
    "Nkol-Eton - Résidentiel",
    
    "Mballa II",
    "Mballa II - Grand Marché",
    "Mballa II - Entrée Marché",
    "Mballa II - Parking",
    
    "Awae",
    "Awae - Village",
    "Awae - Carrefour",
    
    // ============ YAOUNDÉ 3e ============
    "Mokolo",
    "Mokolo - Grand Marché",
    "Mokolo - Marché Mokolo",
    "Mokolo - Carrefour Mokolo",
    "Mokolo - Station Mokolo",
    "Mokolo - Église Mokolo",
    "Mokolo - Mosquée",
    "Mokolo - Entrée Nord",
    "Mokolo - Entrée Sud",
    "Mokolo - Entrée Est",
    "Mokolo - Entrée Ouest",
    "Mokolo - Pharmacie",
    "Mokolo - Château",
    "Mokolo - Dallé",
    
    "Mfoundassi",
    "Mfoundassi - Carrefour",
    "Mfoundassi - Église",
    
    "Nkolndongo",
    "Nkolndongo - Chefferie",
    "Nkolndongo - Marché",
    "Nkolndongo - Carrefour",
    
    "Nkoldongo",
    "Nkoldongo - École",
    
    "Biyem-Assi",
    "Biyem-Assi - District",
    "Biyem-Assi - Carrefour Biyem-Assi",
    "Biyem-Assi - Marché Biyem-Assi",
    "Biyem-Assi - Église Biyem-Assi",
    "Biyem-Assi - Lycée",
    "Biyem-Assi - Cité Verte",
    "Biyem-Assi - Entrée",
    "Biyem-Assi - Sortie",
    "Biyem-Assi - Carrefour District",
    
    "Oyom-Abang",
    "Oyom-Abang - Carrefour",
    "Oyom-Abang - Chefferie",
    
    "Abom-Étoudi",
    "Abom-Étoudi - Palais",
    
    "Étoudi",
    "Étoudi - Palais Présidentiel",
    "Étoudi - Entrée Palais",
    "Étoudi - Carrefour Étoudi",
    
    "Ekounou",
    "Ekounou - Carrefour Ekounou",
    "Ekounou - Terminus",
    "Ekounou - Marché Ekounou",
    "Ekounou - Station",
    "Ekounou - Entrée",
    "Ekounou - Sortie",
    "Ekounou - Pharmacie",
    
    "Nkomo",
    "Nkomo - Carrefour",
    
    "Ngousso",
    "Ngousso - Carrefour Ngousso",
    "Ngousso - Marché Ngousso",
    "Ngousso - Église",
    
    "Essos",
    "Essos - Carrefour Essos",
    "Essos - Station Essos",
    "Essos - Pharmacie",
    "Essos - Entrée",
    "Essos - Sortie",
    "Essos - Centre Commercial",
    
    "Nkolbisson",
    "Nkolbisson - Université",
    "Nkolbisson - Campus",
    "Nkolbisson - Carrefour",
    "Nkolbisson - Marché",
    "Nkolbisson - Chefferie",
    
    "Nsam",
    "Nsam - Carrefour Nsam",
    "Nsam - Marché Nsam",
    "Nsam - Église",
    "Nsam - Entrée",
    
    "Mvan",
    "Mvan - Gare Routière",
    "Mvan - Terminus",
    "Mvan - Carrefour Mvan",
    "Mvan - Marché Mvan",
    "Mvan - Station",
    "Mvan - Entrée",
    "Mvan - Sortie",
    
    "Afanoyoa",
    "Afanoyoa - Carrefour",
    
    "Odza",
    "Odza - Carrefour Odza",
    "Odza - Marché Odza",
    "Odza - Entrée",
    "Odza - Sortie",
    "Odza - Station",
    "Odza - Pharmacie",
    "Odza - Église",
    "Odza - Chefferie",
    
    "Nsimeyelong",
    "Nsimeyelong - Carrefour",
    
    "Nkolmesseng",
    "Nkolmesseng - Carrefour",
    "Nkolmesseng - Église",
    
    "Mbankolo",
    "Mbankolo - Lac",
    "Mbankolo - Carrefour",
    "Mbankolo - Chefferie",
    
    // ============ YAOUNDÉ 4e ============
    "Mimboman",
    "Mimboman - Carrefour Mimboman",
    "Mimboman - Marché Mimboman",
    "Mimboman - Église",
    "Mimboman - Entrée",
    "Mimboman - Sortie",
    "Mimboman - Station",
    "Mimboman - Carrefour 2",
    "Mimboman - Chefferie",
    
    "Nkoul-Éton",
    "Nkoul-Éton - Carrefour",
    
    "Emana",
    "Emana - Carrefour Emana",
    "Emana - Marché Emana",
    "Emana - Entrée",
    "Emana - Station",
    
    "Kondengui",
    "Kondengui - Prison Centrale",
    "Kondengui - Carrefour Kondengui",
    "Kondengui - Entrée Prison",
    "Kondengui - Zone Industrielle",
    
    // ============ YAOUNDÉ 5e ============
    "Mfandena",
    "Mfandena - Palais Polyvalent",
    "Mfandena - Stade",
    "Mfandena - Carrefour",
    
    "Omnisports",
    "Omnisports - Stade Ahmadou Ahidjo",
    "Omnisports - Entrée Stade",
    "Omnisports - Parking",
    
    // ============ YAOUNDÉ 6e ============
    "Mbankomo",
    "Mbankomo - Camp",
    "Mbankomo - Carrefour",
    "Mbankomo - Village",
    
    "Okola",
    "Okola - Centre",
    
    "Soa",
    "Soa - Université",
    "Soa - Campus",
    "Soa - Carrefour",
    "Soa - Village",
    
    "Nkolafamba",
    "Nkolafamba - Village",
    
    "Akono",
    "Akono - Centre",
    
    // ============ YAOUNDÉ 7e ============
    "Mvolyé",
    "Mvolyé - Basilique",
    "Mvolyé - Carrefour",
    "Mvolyé - Colline",
    "Mvolyé - Entrée",
    
    // ============ AUTRES QUARTIERS ============
    "Obili",
    "Obili - Carrefour Obili",
    "Obili - Université",
    
    "Damase",
    "Damase - Carrefour",
    
    "Mendong",
    "Mendong - Carrefour Mendong",
    "Mendong - Marché Mendong",
    "Mendong - Entrée",
    "Mendong - Cité",
    
    "Simbock",
    "Simbock - Carrefour Simbock",
    "Simbock - Marché",
    "Simbock - Entrée",
    
    "Efoulan",
    "Efoulan - Carrefour",
    "Efoulan - Église",
    
    "Ahala",
    "Ahala - Carrefour Ahala",
    "Ahala - Marché Ahala",
    "Ahala - Entrée",
    "Ahala - Sortie",
    "Ahala - Station",
    
    "Nkoabang",
    "Nkoabang - Carrefour",
    "Nkoabang - Village",
    
    "Nkolbikok",
    "Nkolbikok - Carrefour",
    
    "Nkolndan",
    "Nkolndan - Village",
    
    "Nkolfoulou",
    "Nkolfoulou - Village",
    
    "Nkolbogol",
    "Nkolbogol - Village",
    
    "Ekoudou",
    "Ekoudou - Village",
    
    "Ekabita",
    "Ekabita - Carrefour",
    
    "Ekekam",
    "Ekekam - Village",
    
    "Ngoulmekong",
    "Ngoulmekong - Village",
    
    "Nsimi",
    "Nsimi - Village",
    
    "Mvangan",
    "Mvangan - Centre",
    
    "Nkozoa",
    "Nkozoa - Village",
    
    "Nsimeyong",
    "Nsimeyong - Carrefour",
    
    "Mvog-Betsi",
    "Mvog-Betsi - Hôpital Gynéco",
    "Mvog-Betsi - Carrefour",
    
    // ============ QUARTIER DEMANDÉ SPÉCIFIQUEMENT ============
    "Marcher Huitième",
    "Marcher Huitième - Entrée",
    "Marcher Huitième - Carrefour",
    "Marcher Huitième - École",
    
    // ============ QUARTIERS HISTORIQUES & TRADITIONNELS ============
    "Nkol-Nkondengui",
    "Mvog-Mba",
    "Mvog-Betsi",
    "Mvog-Ada",
    "Mvog-Ebanda",
    "Mvog-Mbi",
    "Nkol-Nyada",
    "Nkol-Ngok",
    "Nkol-Ewondo",
    "Nkol-Mbamba",
    "Nkol-Akono",
    "Nkol-Nkono",
    
    // ============ CITÉS ET ZONES RÉSIDENTIELLES ============
    "Cité Verte",
    "Cité Sic",
    "Cité des Enseignants",
    "Cité CAPEC",
    "Cité Mini-Ferme",
    "Cité Parc",
    "Cité SOFA",
    "Cité Fouda",
    "Cité Tsinga",
    "Cité Bastos",
    "Cité Mvan",
    "Cité Odza",
    "Cité Ahala",
    "Cité Mendong",
    "Cité Nkolbisson",
    
    // ============ MARCHÉS (sous-lieux) ============
    "Marché Mfoundi",
    "Marché Central",
    "Marché Mokolo",
    "Marché Mvog-Mbi",
    "Marché Mballa II",
    "Marché Essos",
    "Marché Ekounou",
    "Marché Mvan",
    "Marché Odza",
    "Marché Ahala",
    "Marché Mendong",
    "Marché Nkolbisson",
    "Marché Biyem-Assi",
    "Marché Mimboman",
    "Marché Nsam",
    "Marché Ngousso",
    
    // ============ CARREFOURS CÉLÈBRES ============
    "Carrefour Bastos",
    "Carrefour Nlongkak",
    "Carrefour Mvog-Mbi",
    "Carrefour Essos",
    "Carrefour Ekounou",
    "Carrefour Mvan",
    "Carrefour Odza",
    "Carrefour Ahala",
    "Carrefour Mendong",
    "Carrefour Biyem-Assi",
    "Carrefour Nsam",
    "Carrefour Ngousso",
    "Carrefour Mimboman",
    "Carrefour Kondengui",
    "Carrefour Tsinga",
    "Carrefour Fouda",
    "Carrefour Melen",
    "Carrefour Ngoa-Ekéllé",
    
    // ============ TERMINUS BUS ============
    "Terminus Mvan",
    "Terminus Ekounou",
    "Terminus Odza",
    "Terminus Ahala",
    "Terminus Mendong",
    "Terminus Biyem-Assi",
    "Terminus Nsam",
    "Terminus Essos",
    "Terminus Mimboman",
    "Terminus Nkolbisson",
    "Terminus Mbankolo",
    
    // ============ ZONES INDUSTRIELLES ============
    "Zone Industrielle Kondengui",
    "Zone Industrielle Mvan",
    "Zone Industrielle Nsam",
    "Zone Industrielle Mfoundi",
    
    // ============ UNIVERSITÉS & CAMPUS ============
    "Université de Yaoundé I - Ngoa-Ekéllé",
    "Université de Yaoundé II - Soa",
    "Université Catholique - Mvolyé",
    "Université Protestante - Nkolbisson",
    "ENS - Ngoa-Ekéllé",
    "ENSP - Ngoa-Ekéllé",
    "FMSB - Mvog-Betsi",
    "ESSEC - Ngoa-Ekéllé",
    "IRIC - Ngoa-Ekéllé",
    
    // ============ HÔPITAUX ============
    "Hôpital Central - Nlongkak",
    "Hôpital Gynéco - Mvog-Betsi",
    "Hôpital Jamot - Mvog-Mbi",
    "CMC - Biyem-Assi",
    "CMC - Mendong",
    "CMC - Odza",
    "CMC - Ekounou",
    "Hôpital Militaire - Tsinga",
    
    // ============ STADES ============
    "Stade Ahmadou Ahidjo - Omnisports",
    "Palais Polyvalent - Mfandena",
    "Stade Mvog-Mbi",
    "Stade Ngoa-Ekéllé",
    "Stade Tsinga",
    "Stade Essos",
    
    // ============ LACS ============
    "Lac Municipal - Olezoa",
    "Lac Mbankolo",
    "Lac Melen",
    "Lac Ngoa-Ekéllé",
    
    // ============ PALAIS ET INSTITUTIONS ============
    "Palais Présidentiel - Étoudi",
    "Palais de l'Unité - Étoudi",
    "Primature - Nlongkak",
    "Assemblée Nationale - Ngoa-Ekéllé",
    "Sénat - Mvog-Mbi",
    "Conseil Constitutionnel - Nlongkak",
    "Cour Suprême - Mvog-Mbi",
    "Sous manguier",
    "Belle mere",
    "Carosel",
    "Nouvelle route Carosel",
    "essomba",
    "anguissa",
    "Nkolbisson",
    "fougerole",
    "biteng",
    "Emana",
    "messassi",
    "Etoudi",
    "Manguier",
    "ekie",
    "EKOUMDOUM",
    "obili",
    "mvolye",
    "ngoa-ekele"
  ],
  
  Bafoussam: ["Tamdja", "Banengo", "Djeleng", "Nkong-Zem", "Koptchou", "Famla", "Houkaha", "Kouékong", "Ndiangdam", "Kamkop", "Toungang", "Tocket", "Diadam", "Baleng", "Nsimalen", "Bamendzi", "Ndé", "Ndenkop", "Ndiangsouam", "Ngoueng", "Kamkop", "Banego", "Djeleng II"],
  
  Bamenda: ["Mankon", "Nkwen", "Bali", "Bafut", "Up-Station", "Old Church", "Mile 2", "Mile 3", "Mile 4", "Cow Street", "Abakwa", "Mulang", "Below Fongu", "Atuak", "Mendakwe", "Ndamukong", "Chomba", "Mbatu", "Ntenefor", "Mbei", "Bambili"],
  
  Garoua: ["Lainde", "Yelwa", "Roumdé Adjia", "Djamboutou", "Nassarao", "Pitoa", "Poumpoumré", "Foulberé", "Louti", "Gashiga", "Douloungou", "Ngong", "Touboro", "Ouro-Djouka", "Ouro-Hesso", "Ouro-Labo", "Ouro-Tchédé", "Lagdo", "Mayo-Kébi", "Benoué"],
  
  Maroua: ["Kakataré", "Doursoungo", "Douggoï", "Domayo", "Pitoaré", "Ouro-Tchédé", "Djarengol", "Baouliwol", "Zokok", "Hardé", "Kodek", "Miskine", "Palar", "Ouro-Djama", "Diguirwo", "Gawel", "Gouzda", "Mayel", "Djarengol", "Lougga"],
  
  Ngaoundéré: ["Baladji I", "Baladji II", "Joli Soir", "Dang", "Bamyanga", "Sabongari", "Mboum", "Yelwa", "Haoussa", "Mbakaou", "Nganha", "Martap", "Nyambaka", "Beka", "Mbe", "Tibati", "Bankim", "Banyo", "Mayo-Banyo", "Farato"],
  
  Limbe: ["Down Beach", "Bota", "Middle Farms", "Mile 4", "New Town", "Ngeme", "Cassava Farms", "Man O' War Bay", "Mile 2", "Mile 1", "Bimbia", "Idenau", "Kombe", "Batoke", "Bakingili", "Debundscha", "Bamusso", "Isanguele", "Bomana", "Boanda"],
  
  Buea: ["Molyko", "Mile 17", "Check Point", "Bonduma", "Great Soppo", "Bokwango", "Buea Town", "Bolifamba", "Muea", "Bova", "Likoko", "Wokeka", "Ewonda", "Bokwai", "Bwitingi", "Mile 16", "Small Soppo", "Bokova"],
  
  Bertoua: ["Enia", "Yadémé", "Kpokolota", "Ndokayo", "Monou", "Tigaza", "Bonis", "Belinga", "Dimako", "Doumé", "Gado", "Kette", "Mbang", "Ndemba", "Nguelemendouka", "Nguelebok", "Ndélélé", "Yokadouma", "Lomie", "Abong-Mbang"],
  
  Ebolowa: ["Mekalat", "Angalé", "Biyébe", "New Bell", "Nko'ovos", "Ebolowa Si II", "Mvangan", "Biwong", "Mengong", "Ngoulemakong", "Akom", "Meyo", "Nkolandom", "Ambam", "Ma'an", "Campo", "Kye-Ossi", "Djoum", "Mintom", "Oveng"],
  
  Kribi: ["Dôme", "Mboa Manga", "Talla", "Nziou", "Bwanjo", "Mpangou", "Londji", "Grand Batanga", "Petit Batanga", "Ebodjé", "Campo", "Lokoundjé", "Bipindi", "Lolabe", "Mvini", "Bekoko", "Nkongsamba", "Edea"],
  
  Nkongsamba: ["Baré", "Quartier 1", "Quartier 2", "Quartier 3", "Ekel-Ko", "Mbaressoumtou", "Ndogbong", "Manengole", "Melong", "Santchou", "Nlonako", "Ebone", "Moungo", "Loum", "Manjo", "Penja", "Njombe", "Mbanga", "Kekem"],
  
  Dschang: ["Foréké", "Foto", "Keleng", "Tsinfing", "Apouh", "Mingmeto", "Bafou", "Fongo-Tongo", "Fongo-Ndeng", "Santchou", "Banka", "Bamendjou", "Baleveng", "Balessing", "Bamesso", "Bamougoum", "Bansoa", "Bandja", "Batcha", "Batseng"]
};

export default function FormulaireClient() {
  const domicilePhotoRef = useRef(null);
  const activitePhotoRef = useRef(null);
  const cniRectoRef = useRef(null);
  const cniVersoRef = useRef(null);
  const niuImageRef = useRef(null);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    ouvert: false,
    message: "",
    severite: "success"
  });

  const [etapeActive, setEtapeActive] = useState(0);
  const [agences, setAgences] = useState([]);
  const [numeroClientGenere, setNumeroClientGenere] = useState("EN ATTENTE...");
  const [apercuCniRecto, setApercuCniRecto] = useState(null);
  const [apercuCniVerso, setApercuCniVerso] = useState(null);
  const [apercuNiuImage, setApercuNiuImage] = useState(null);
  const [inputQuartierValue, setInputQuartierValue] = useState("");

  const { 
    control, 
    handleSubmit, 
    trigger, 
    watch, 
    setValue, 
    formState 
  } = useForm({
    defaultValues: {
      agency_id: "",
      type_client: "physique",
      nom_prenoms: "",
      sexe: "",
      date_naissance: "",
      lieu_naissance: "",
      nationalite: "Camerounaise",
      adresse_ville: "",
      adresse_quartier: "",
      lieu_dit_domicile: "",
      photo_localisation_domicile: null,
      lieu_dit_activite: "",
      ville_activite: "",
      quartier_activite: "",
      photo_localisation_activite: null,
      bp: "",
      email: "",
      telephone: "",
      pays_residence: "Cameroun",
      cni_numero: "",
      cni_delivrance: "",
      cni_expiration: "",
      nui: "",
      cni_recto: null,
      cni_verso: null,
      niu_image: null,
      nom_mere: "",
      nom_pere: "",
      nationalite_mere: "",
      nationalite_pere: "",
      profession: "",
      employeur: "",
      situation_familiale: "",
      nom_conjoint: "",
      date_naissance_conjoint: "",
      cni_conjoint: "",
      profession_conjoint: "",
      salaire: "",
      tel_conjoint: "",
      solde_initial: "0",
      immobiliere: "",
      autres_biens: "",
      photo: null,
      signature: null,
    },
    resolver: (data, context, options) => {
      return yupResolver(schemas[etapeActive])(data, context, options);
    },
    mode: "onTouched",
    shouldUnregister: false,
  });

  const { errors: erreurs } = formState;

  const agenceSelectionnee = watch("agency_id");
  const villeSelectionnee = watch("adresse_ville");
  const quartierSelectionne = watch("adresse_quartier");

  useEffect(() => {
    ApiClient.get("/agencies")
      .then((res) => {
        const liste = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAgences(liste);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des agences:", err);
        afficherSnackbar("Erreur lors du chargement des agences", "error");
      });
  }, []);

  useEffect(() => {
    if (agenceSelectionnee) {
      ApiClient.get(`/agencies/${agenceSelectionnee}/next-number`)
        .then((res) => {
          setNumeroClientGenere(res.data.next_number);
          console.log("Numéro client généré:", res.data.next_number);
        })
        .catch((err) => {
          console.error("Erreur de génération du numéro:", err);
          setNumeroClientGenere("ERREUR");
          afficherSnackbar("Erreur de génération du numéro client", "error");
        });
    } else {
      setNumeroClientGenere("Sélectionnez une agence");
    }
  }, [agenceSelectionnee]);

  const optionsQuartiers = useMemo(() =>
    (villeSelectionnee ? DONNEES_VILLES[villeSelectionnee] || [] : []),
    [villeSelectionnee]
  );

  const afficherSnackbar = (message, severite = "success") => {
    setSnackbar({
      ouvert: true,
      message,
      severite
    });
  };

  const fermerSnackbar = () => {
    setSnackbar({ ...snackbar, ouvert: false });
  };

  const gererChangementCniRecto = (e, onChange) => {
    const fichier = e.target.files[0];
    if (fichier) {
      onChange(fichier);
      setApercuCniRecto(URL.createObjectURL(fichier));
    }
  };

  const gererChangementCniVerso = (e, onChange) => {
    const fichier = e.target.files[0];
    if (fichier) {
      onChange(fichier);
      setApercuCniVerso(URL.createObjectURL(fichier));
    }
  };

  const gererChangementNiuImage = (e, onChange) => {
    const fichier = e.target.files[0];
    if (fichier) {
      onChange(fichier);
      setApercuNiuImage(URL.createObjectURL(fichier));
    }
  };

  const supprimerFichier = (champ, setApercu = null) => {
    setValue(champ, null, { shouldValidate: true });
    if (setApercu) {
      setApercu(null);
    }
  };

  const formaterMessageErreur = (donneesErreur) => {
    if (!donneesErreur) return "Une erreur est survenue";

    if (typeof donneesErreur === 'string') {
      return donneesErreur;
    }

    if (donneesErreur.errors) {
      const messagesErreur = Object.values(donneesErreur.errors).flat();
      if (messagesErreur.length > 0) {
        const erreursTraduites = messagesErreur.map(msg => {
          if (msg.includes('already been taken')) {
            if (msg.includes('cni_numero')) return "Ce numéro de CNI existe déjà";
            if (msg.includes('nom_prenoms')) return "Un client avec ce nom existe déjà";
            if (msg.includes('nui')) return "Ce NUI est déjà utilisé";
          }
          if (msg.includes('must be an image')) return "Le fichier doit être une image";
          if (msg.includes('max:2048')) return "L'image ne doit pas dépasser 2MB";
          return msg;
        });
        return erreursTraduites.join(', ');
      }
    }

    if (donneesErreur.message) {
      if (donneesErreur.message.includes('already exists')) {
        return "Ce client existe déjà dans la base de données";
      }
      return donneesErreur.message;
    }

    return "Une erreur est survenue lors de l'enregistrement";
  };

  const soumettreFormulaire = async (donnees) => {
    console.log("Données du formulaire physique:", donnees);

    try {
      const formData = new FormData();

      formData.append("agency_id", donnees.agency_id);
      formData.append("type_client", "physique");
      formData.append("telephone", donnees.telephone || "");
      formData.append("email", donnees.email || "");
      formData.append("adresse_ville", donnees.adresse_ville || "");
      formData.append("adresse_quartier", donnees.adresse_quartier || "");
      formData.append("lieu_dit_domicile", donnees.lieu_dit_domicile || "");
      formData.append("lieu_dit_activite", donnees.lieu_dit_activite || "");
      formData.append("ville_activite", donnees.ville_activite || "");
      formData.append("quartier_activite", donnees.quartier_activite || "");
      formData.append("bp", donnees.bp || "");
      formData.append("pays_residence", donnees.pays_residence || "Cameroun");
      formData.append("nui", donnees.nui || "");
      formData.append("solde_initial", donnees.solde_initial || "0");
      formData.append("immobiliere", donnees.immobiliere || "");
      formData.append("autres_biens", donnees.autres_biens || "");

      if (donnees.photo_localisation_domicile) {
        formData.append("photo_localisation_domicile", donnees.photo_localisation_domicile);
      }

      if (donnees.photo_localisation_activite) {
        formData.append("photo_localisation_activite", donnees.photo_localisation_activite);
      }

      formData.append("nom_prenoms", donnees.nom_prenoms);
      formData.append("sexe", donnees.sexe);
      formData.append("date_naissance", donnees.date_naissance);
      formData.append("lieu_naissance", donnees.lieu_naissance || "");
      formData.append("nationalite", donnees.nationalite || "Camerounaise");
      formData.append("cni_numero", donnees.cni_numero || "");
      formData.append("cni_delivrance", donnees.cni_delivrance || "");
      formData.append("cni_expiration", donnees.cni_expiration || "");
      formData.append("nom_pere", donnees.nom_pere || "");
      formData.append("nom_mere", donnees.nom_mere || "");
      formData.append("nationalite_pere", donnees.nationalite_pere || "");
      formData.append("nationalite_mere", donnees.nationalite_mere || "");
      formData.append("profession", donnees.profession || "");
      formData.append("employeur", donnees.employeur || "");
      formData.append("situation_familiale", donnees.situation_familiale || "");
      formData.append("regime_matrimonial", donnees.regime_matrimonial || "");
      formData.append("nom_conjoint", donnees.nom_conjoint || "");
      formData.append("date_naissance_conjoint", donnees.date_naissance_conjoint || "");
      formData.append("cni_conjoint", donnees.cni_conjoint || "");
      formData.append("profession_conjoint", donnees.profession_conjoint || "");
      formData.append("salaire", donnees.salaire || "");
      formData.append("tel_conjoint", donnees.tel_conjoint || "");

      if (donnees.photo) {
        formData.append("photo", donnees.photo);
      }

      if (donnees.signature) {
        formData.append("signature", donnees.signature);
      }

      if (donnees.cni_recto) {
        formData.append("cni_recto", donnees.cni_recto);
      }

      if (donnees.cni_verso) {
        formData.append("cni_verso", donnees.cni_verso);
      }

      if (donnees.niu_image) {
        formData.append("niu_image", donnees.niu_image);
      }

      console.log("Envoi FormData...");
      const reponse = await ApiClient.post("/clients/physique", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json"
        }
      });

      console.log("Réponse API:", reponse.data);

      if (reponse.data.success) {
        afficherSnackbar(`Client créé avec succès! Numéro: ${reponse.data.num_client}`, "success");
        setTimeout(() => {
          navigate("/client");
        }, 2000);
      } else {
        const messageErreur = formaterMessageErreur(reponse.data);
        afficherSnackbar(messageErreur, "error");
      }
    } catch (erreur) {
      console.error("Erreur API détail:", erreur.response?.data || erreur.message);
      const messageErreur = formaterMessageErreur(erreur.response?.data);
      afficherSnackbar(messageErreur, "error");
    }
  };

  const passerAEtapeSuivante = async () => {
    const champsRequisParEtape = {
      0: ["agency_id", "nom_prenoms", "sexe", "date_naissance"],
      1: ["adresse_ville", "adresse_quartier", "telephone"],
      2: [],
      3: [],
      4: [],
    };
    
    const champsAValider = champsRequisParEtape[etapeActive] || [];
    
    if (champsAValider.length === 0) {
      setEtapeActive(s => s + 1);
      return true;
    }
    
    const valide = await trigger(champsAValider);
    if (valide) {
      setEtapeActive(s => s + 1);
      return true;
    }
    
    return false;
  };

  return (
    <Layout>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: blueGrey[50], py: 5 }}>
          <Container maxWidth="lg">
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: indigo[900] }}>
                Nouveau Client Physique
              </Typography>

              <Stepper activeStep={etapeActive} alternativeLabel sx={{ mb: 5 }}>
                {ETAPES.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
              </Stepper>

              <form onSubmit={handleSubmit(
                soumettreFormulaire,
                (errors) => {
                  console.log("ERREURS DE VALIDATION:", errors);
                  afficherSnackbar("Veuillez remplir tous les champs obligatoires", "error");
                }
              )}>
                <Box sx={{ minHeight: "450px" }}>

                  {/* ÉTAPE 0 : ADMINISTRATIF & IDENTITÉ */}
                  {etapeActive === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Infos Agence
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="agency_id" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.agency_id} required sx={{ minWidth: 200 }}>
                            <InputLabel>Agence *</InputLabel>
                            <Select label="Agence *" {...field} value={field.value || ""}>
                              {agences.map((a) => (
                                <MenuItem key={a.id} value={a.id}>{a.code} - {a.agency_name || a.nom}</MenuItem>
                              ))}
                            </Select>
                            {erreurs?.agency_id && <FormHelperText>{erreurs.agency_id.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="ID Client"
                          value={numeroClientGenere}
                          disabled
                          variant="filled"
                          InputProps={{ readOnly: true, style: { fontWeight: 'bold' } }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Identité
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Controller name="nom_prenoms" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Nom & Prénoms *"
                            required
                            error={!!erreurs?.nom_prenoms}
                            helperText={erreurs?.nom_prenoms?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="sexe" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.sexe} required sx={{ minWidth: 200 }}>
                            <InputLabel>Sexe *</InputLabel>
                            <Select label="Sexe *" {...field} value={field.value || ""}>
                              <MenuItem value="M">Masculin</MenuItem>
                              <MenuItem value="F">Féminin</MenuItem>
                            </Select>
                            {erreurs?.sexe && <FormHelperText>{erreurs.sexe.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="date_naissance" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="date"
                            label="Date Naissance *"
                            required
                            InputLabelProps={{ shrink: true }}
                            error={!!erreurs?.date_naissance}
                            helperText={erreurs?.date_naissance?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_naissance" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Lieu Naissance" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="nationalite" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nationalité" />
                        )} />
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 1 : LOCALISATION & CONTACT */}
                  {etapeActive === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Localisation Domicile
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="adresse_ville" control={control} render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!erreurs?.adresse_ville} required sx={{ minWidth: 200 }}>
                            <InputLabel>Ville *</InputLabel>
                            <Select label="Ville *" {...field} value={field.value || ""}>
                              {Object.keys(DONNEES_VILLES).map(v => (
                                <MenuItem key={v} value={v}>{v}</MenuItem>
                              ))}
                            </Select>
                            {erreurs?.adresse_ville && <FormHelperText>{erreurs.adresse_ville.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller
                          name="adresse_quartier"
                          control={control}
                          sx={{ minWidth: 250 }}
                          render={({ field }) => (
                            <Autocomplete
                              {...field}
                              size="small"
                              disabled={!villeSelectionnee}
                              options={optionsQuartiers}
                              value={quartierSelectionne || null}
                              onChange={(event, newValue) => {
                                field.onChange(newValue || "");
                              }}
                              inputValue={inputQuartierValue}
                              onInputChange={(event, newInputValue) => {
                                setInputQuartierValue(newInputValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Quartier *"
                                  sx={{ minWidth: 250 }}
                                  required
                                  error={!!erreurs?.adresse_quartier}
                                  helperText={erreurs?.adresse_quartier?.message}
                                  placeholder={villeSelectionnee ? "Rechercher un quartier..." : "Sélectionnez d'abord une ville"}
                                  InputProps={{
                                    ...params.InputProps,
                                    sx: { fontSize: '0.875rem' }
                                  }}
                                />
                              )}
                              noOptionsText="Aucun quartier trouvé"
                              loadingText="Chargement..."
                              getOptionLabel={(option) => option}
                              filterOptions={(options, { inputValue }) => {
                                const inputValueLower = inputValue.toLowerCase();
                                return options.filter(option =>
                                  option.toLowerCase().includes(inputValueLower)
                                );
                              }}
                              renderOption={(props, option) => (
                                <li {...props}>
                                  <Typography variant="body2">{option}</Typography>
                                </li>
                              )}
                              sx={{ width: '100%' }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="lieu_dit_domicile" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Lieu-dit Domicile" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo Localisation Domicile / recto et verso <br/>(description detailee au vero du lieu du Domicile, point de repere, etc...)
                          </Typography>
                          <Controller name="photo_localisation_domicile" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                                ref={domicilePhotoRef}
                              />
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Localisation Activité
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="ville_activite" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Ville Activité"
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="quartier_activite" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Quartier Activité"
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Lieu-dit Activités
                        </Typography>
                        <Controller name="lieu_dit_activite" control={control} render={({ field }) => (
                          <TextareaAutosize
                            {...field}
                            fullWidth
                            size="small"
                            label="Lieu-dit Activités"
                            maxRows={4}
                            placeholder="Lieu-dit Activités"
                            style={{ width: 200 }}                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Géolocalisation Activité
                          </Typography>
                          <Controller name="photo_localisation_activite" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                                ref={activitePhotoRef}
                              />
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Contact
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="telephone" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Téléphone Principal *"
                            required
                            error={!!erreurs?.telephone}
                            helperText={erreurs?.telephone?.message}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="email" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Email" type="email" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="bp" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Boite Postale" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="pays_residence" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Pays de Résidence" value="Cameroun" disabled />
                        )} />
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 2 : DOCUMENTS & PROFESSION */}
                  {etapeActive === 2 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Documents d'Identité
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="cni_numero" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="N° CNI"
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="cni_delivrance" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="date"
                            label="Délivré le"
                            InputLabelProps={{ shrink: true }}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="cni_expiration" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="date"
                            label="Expire le"
                            InputLabelProps={{ shrink: true }}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="nui" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="N° NUI"
                            placeholder="Ex: M1234567890"
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Profession
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="profession" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            label="Profession"
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="employeur" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Employeur" />
                        )} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Documents Personnels
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Photo du Client
                          </Typography>
                          <Controller name="photo" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                              />
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: indigo[700] }}>
                            Signature du Client
                          </Typography>
                          <Controller name="signature" control={control} render={({ field }) => (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => field.onChange(e.target.files[0])}
                              />
                            </div>
                          )} />
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 3 : FAMILLE & BIENS */}
                  {etapeActive === 3 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Parents
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="nom_pere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nom du Père" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="nationalite_pere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nationalité Père" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="nom_mere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nom de la Mère" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Controller name="nationalite_mere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nationalité Mère" />
                        )} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Situation Familiale
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="situation_familiale" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Situation Familiale" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Controller name="nom_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Nom du Conjoint" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="date_naissance_conjoint" control={control} render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            type="date"
                            label="Date Naissance Conjoint"
                            InputLabelProps={{ shrink: true }}
                          />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="cni_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="CNI Conjoint" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="profession_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Profession Conjoint" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="salaire" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Salaire" type="number" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="tel_conjoint" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Téléphone Conjoint" />
                        )} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                          Biens et Patrimoine
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Controller name="solde_initial" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="CAPITAL" type="number" />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <Controller name="immobiliere" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Immobilière" multiline rows={2} />
                        )} />
                      </Grid>

                      <Grid item xs={12} md={12}>
                        <Controller name="autres_biens" control={control} render={({ field }) => (
                          <TextField {...field} fullWidth size="small" label="Autres Biens" multiline rows={3} />
                        )} />
                      </Grid>
                    </Grid>
                  )}

                  {/* ÉTAPE 4 : DOCUMENTS CNI & NUI */}
                  {etapeActive === 4 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Documents CNI (Recto et Verso)
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Recto de la CNI
                            </Typography>
                            {apercuCniRecto && (
                              <IconButton size="small" onClick={() => supprimerFichier('cni_recto', setApercuCniRecto)}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {apercuCniRecto && (
                            <img
                              src={apercuCniRecto}
                              alt="Recto CNI"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }}
                            />
                          )}
                          <Controller name="cni_recto" control={control} render={({ field }) => (
                            <div>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ mt: 1 }}
                              >
                                {apercuCniRecto ? 'Changer le recto' : 'Télécharger le recto'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => gererChangementCniRecto(e, field.onChange)}
                                  ref={cniRectoRef}
                                />
                              </Button>
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Verso de la CNI
                            </Typography>
                            {apercuCniVerso && (
                              <IconButton size="small" onClick={() => supprimerFichier('cni_verso', setApercuCniVerso)}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {apercuCniVerso && (
                            <img
                              src={apercuCniVerso}
                              alt="Verso CNI"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }}
                            />
                          )}
                          <Controller name="cni_verso" control={control} render={({ field }) => (
                            <div>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ mt: 1 }}
                              >
                                {apercuCniVerso ? 'Changer le verso' : 'Télécharger le verso'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => gererChangementCniVerso(e, field.onChange)}
                                  ref={cniVersoRef}
                                />
                              </Button>
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 4 }}>
                          Photocopie NUI
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: indigo[700] }}>
                              Photocopie NUI
                            </Typography>
                            {apercuNiuImage && (
                              <IconButton size="small" onClick={() => supprimerFichier('niu_image', setApercuNiuImage)}>
                                <Close fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {apercuNiuImage && (
                            <img
                              src={apercuNiuImage}
                              alt="Photocopie NUI"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }}
                            />
                          )}
                          <Controller name="niu_image" control={control} render={({ field }) => (
                            <div>
                              <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                sx={{ mt: 1 }}
                              >
                                {apercuNiuImage ? 'Changer la photocopie NUI' : 'Télécharger la photocopie NUI'}
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  onChange={(e) => gererChangementNiuImage(e, field.onChange)}
                                  ref={niuImageRef}
                                />
                              </Button>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                Photocopie du document NUI - Format: JPG, PNG (max 2MB)
                              </Typography>
                            </div>
                          )} />
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Veuillez télécharger les deux côtés de la CNI (recto et verso) ainsi que la photocopie du NUI.
                          Format accepté : JPG, PNG (max 2MB par fichier)
                        </Alert>
                      </Grid>
                    </Grid>
                  )}

                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    variant="outlined"
                    type="button"
                    disabled={etapeActive === 0}
                    onClick={() => setEtapeActive(s => s - 1)}
                  >
                    Précédent
                  </Button>

                  {etapeActive === ETAPES.length - 1 ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      type="submit"
                      sx={{ px: 4 }}
                    >
                      Enregistrer le client
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        passerAEtapeSuivante();
                      }}
                    >
                      Suivant
                    </Button>
                  )}
                </Box>                
              </form>
            </Paper>
          </Container>
        </Box>

        <Snackbar
          open={snackbar.ouvert}
          autoHideDuration={6000}
          onClose={fermerSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={fermerSnackbar}
            severity={snackbar.severite}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </Layout>
  );
}