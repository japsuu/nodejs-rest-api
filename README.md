# NodeJS REST API Example

## Tarvittavat ohjelmistot

- git
- NodeJS

## Käyttöönotto

1. Kloonaa repositorio koneellesi:
   - **git clone --branch actual_lecture_9 https://github.com/MatiasHiltunen/rest_api_example.git lecture_9_example**
   - **cd lecture_9_example**
2. Varmista että oikea git-branch on aktiivisena. Kloonaamisen jälkeen ilman tuota "--branch actual_lecture_9" oletuksena on main-branch aktiisena, se näkyy esim. VS Coden vasemmassa alalaidassa, ja sitä klikkaamalla avautuu valikko mistä paikallisen repositorion aktiivisen branchin voi vaihtaa. Tässä tapauksessa branchin tulisi olla "actual_lecture_9". Vaihtoehtoisesti branchin voi vaihtaa komentoriviltä komennolla "git checkout actual_lecture_9".
3. Suorita komento **npm install** asentaaksesi package.json tiedostossa määritellyt npm-paketit joita projektissa käytetään (dependencies)
4. Luo .env -niminen tiedosto on kansion juureen ja lisää sinne ympäristömuuttuja **JWT_SECRET** avainarvoparina seuraavasti: "JWT_SECRET=tähän_satunnainen_merkkijono_salaisuudeksi_millä_jwt_token_allerkirjoitetaan_ja_luetaan". Muista tallentaa muutokset.
5. Käynnistä kehityspalvelin komennolla **npm run dev**

