## ✅ 1. Qualité des données (adapté à la plateforme de bateaux)

| Champ       | Type    | Contraintes                                                                                                           | Norme / Remarque |
|-------------|---------|-----------------------------------------------------------------------------------------------------------------------|------------------|
| boat_name   | string  | **Obligatoire** (`non null`), longueur ≤ 100, encodage UTF‑8, suppression des espaces en début et en fin              | Texte libre      |
| boat_year   | integer | **Obligatoire** (`non null`), valeur ≥ 1800 et ≤ (année courante + 10), uniquement numérique                          | ISO 8601 (année) |
| boat_type   | enum    | **Obligatoire** (`non null`), valeur parmi la liste contrôlée ci‑dessous                                              | Enum interne     |

**Valeurs autorisées pour `boat_type`** :  
✅ Sailboat  
✅ Motorboat  
✅ Yacht  
✅ FishingBoat  
✅ Houseboat  
✅ Canoe  
✅ Kayak  
✅ Ferry  
✅ Speedboat  
✅ Tugboat
