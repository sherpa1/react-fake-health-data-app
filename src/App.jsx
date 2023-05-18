import axios from "axios";
import jwt_decode from "jwt-decode";
import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";

import "./App.css";

function App() {
  const login = import.meta.env.VITE_API_LOGIN;
  const password = import.meta.env.VITE_API_PASSWORD;

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [userId, setUserId] = useState();

  useEffect(() => {
    async function signIn() {
      //connecte l'utilisateur à l'API afin d'obtenir un access_token (JWT)
      //l'access_token permet d'interagir avec l'API en mode authentifié
      //communication de l'identifiant et du mot de passe de l'utilisateur
      //via le header HTTP Authorization en mode Basic

      try {
        setLoading(true);
        setError(false);

        const response = await axios.post(
          import.meta.env.VITE_API + "auth/signin",
          null,
          { auth: { username: login, password: password } }
        );

        setLoading(false);

        if (response.status === 200) {
          //mise à jour de l'access_token
          //attention, l'access_token a une durée de validité d'1 heure
          //pour obtenir un nouvel access_token, il faut effectuer un nouveau login ou employer le refresh_token
          setAccessToken(response.data.access_token);
          //mise à jour du refresh_token
          setRefreshToken(response.data.refresh_token);

          //récupération des informations, converties en Base64, stockées dans le Payload de l'access_token
          const payload = jwt_decode(accessToken);
          setUserId(payload.id); //id de l'utilisateur connecté
        } else {
          console.error(response.status);
          setError("Can't Sign In");
        }
      } catch (error) {
        console.error(error);

        setLoading(false);
        setError("Can't Sign In");
      }
    }

    signIn();
  }, [accessToken, login, password]);

  useEffect(() => {
    async function getPeople() {
      //permet d'obtenir la liste des utilisateurs fictifs depuis l'API

      try {
        setLoading(true);
        setError(false);

        //requête HTTP auprès de l'API
        //authentification à l'aide de l'access_token obtenu lors du sign in
        //communication de l'access_token via le header HTTP Authorization en mode bearer
        const response = await axios.get(import.meta.env.VITE_API + "people", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setLoading(false);

        if (response.status === 200) {
          //mise à jour des personnes fictives
          setPeople(response.data.people);
        } else if (response.status === 498) {
          console.error(response.status);
          setError("Access Token has expired");
        } else {
          console.error(response.status);
          setError("Can't Fetch API");
        }
      } catch (error) {
        console.error(error);

        setLoading(false);
        setError("Can't Fetch API");
      }
    }

    if (accessToken) getPeople();
  }, [accessToken]);

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p>Sorry, an error has occured : {error}</p>}
      {people.length &&
        people.map((aPeople) => (
          <p key={uuid()}>{aPeople.firstname + " " + aPeople.lastname}</p>
        ))}
    </>
  );
}

export default App;
