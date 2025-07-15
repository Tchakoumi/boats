# TP : Tests de Charge & Performance

## 📌 Contexte

Dans le cadre de ce TP, vous allez préparer un plan de tests de charge pour votre plateforme web. Vous devez produire **plusieurs livrables techniques** démontrant votre compréhension des enjeux de qualité, de scalabilité et de performance.

---

## ✅ Livrables attendus

### 1. Qualité des données *(optionnel)*
- **But** : Identifier les types de données manipulées par votre plateforme.
- **À inclure** :
  - Type de données : utilisateurs, commandes, logs…
  - Normes : formats (ex. JSON, ISO 8601), encodage, contraintes de champs.
- **Format suggéré** : tableau `.csv`, `.xlsx` ou `.md` :
  | Champ         | Type   | Contraintes       | Norme      |
  |---------------|--------|-------------------|------------|
  | user_email    | string | non null, regex   | RFC 5322   |
  | created_at    | date   | non null          | ISO 8601   |

### 2. Fiabilité des données *(obligatoire)*
- **But** : Garantir la fiabilité des données tout au long du projet.
- **À inclure** :
  - Méthodes de validation (ex. assertions, tests automatisés).
  - Intégrité des données : vérifications de cohérence des données cotés front et cotés back.
  - Sécurité du stockage et des flux.
- **Format suggéré** : diagramme de flux + tableau de validation et présentation du code source.

### 3. Estimation de la charge utilisateur *(obligatoire)*

- **But** : Définir combien d’utilisateurs utiliseront votre service, de façon totale et simultanée.
- **À inclure** :
  - Hypothèses (trafic réel, marketing, lancement produit…)
  - Modèle de charge : ramp-up, plateau, pic, ramp-down
  - Profil utilisateur (navigation, action typique)


**Format suggéré** : Powerpoint ou document annexe de présentation de la cible et pourcentage pour l'hypothèse. Puis mis à jour des paramètres Locust en JSON.

#### ✅ Exemple de JSON

```json
{
  "users_total": 10000,
  "users_concurrent": 300,
  "load_pattern": "ramp-up: 10min -> plateau: 30min -> down: 5min"
}
```

### 4. Plan d’actions correctives exemple

**Format suggéré** :

| Endpoint       | KPI Observé | Seuil   | Problème              | Action Corrective         | Délai |
|----------------|-------------|---------|------------------------|----------------------------|--------|
| `/login`       | 980 ms      | < 300ms | Temps de réponse long | Mise en cache Redis        | 48h    |
| `/cart/add`    | 6% erreurs  | < 1%    | Trop d’erreurs 500     | Validation des entrées + retry API | 72h    |

---

### 5. Benchmark d’outils JS (1 page) *(optionnel)*

| Outil             | Langage   | Avantages                            | Inconvénients                    |
|------------------|-----------|--------------------------------------|----------------------------------|
| k6               | JS / Go   | CLI performant, scripting flexible   | Peu de visualisation intégrée    |
| Artillery        | JS        | Syntaxe simple (YAML), facile à apprendre | Moins rapide pour de très gros tests |
| Jest + Puppeteer | JS        | Intégration UI + API dans un seul outil | Peu adapté aux tests de charge massifs |

#### Liens utiles

- [k6.io/docs](https://k6.io/docs)
- [artillery.io/docs](https://www.artillery.io/docs)
- [Puppeteer GitHub](https://github.com/puppeteer/puppeteer)
- [Locust](https://locust.io/)

---

### 6. Résultats des tests avec Locust

#### Script utilisé (`locustfile.py`)

```python
from locust import HttpUser, task

class WebsiteUser(HttpUser):
    @task
    def homepage(self):
        self.client.get("/")
```

### 7. Code source sur github