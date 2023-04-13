const router = require("express").Router();

const { PlaceDelivery } = require("../../db/db");

/**
 * Retrieves all the delivery places from the DB
 */
router.get("/", async (req, res) => {
  const places = await PlaceDelivery.findAll();
  res.json(places);
});

router.get("/:placeId", async (req, res) => {
  const { placeId } = req.params;
  const place = await PlaceDelivery.findAll({ where: { id: placeId } });

  res.json(place);
});

router.get("/getPlaceByCP/:cp", async (req, res) => {
  const { cp } = req.params;

  try {
    const place = await PlaceDelivery.findAll({
      where: { cp: cp },
    });

    if (!place) return res.json({ error: "No se encontro ese lugar" });
    return res.json(place);
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/getPlaceByAdress/:address", async (req, res) => {
  const { address } = req.params;
  const order = req.query.order || "ASC";
  try {
    const Places = await PlaceDelivery.findAll({
      order: [["name", order]],
    });

    let places = Places.map((place)=>{
      if(place.address.includes(address)){
        return place;
      }
    })

    places = places.filter(Boolean);


    if (!places) return res.json({ error: "No se encontro ese nombre" });
    return res.json(places);
  } catch (error) {
    return res.json({ error });
  }
});

router.post("/", async (req, res) => {
  const place = await PlaceDelivery.create(req.body);
  res.json(place);
});

router.put("/:placeId", async (req, res) => {
  const { placeId } = req.params;
  const isFind = await PlaceDelivery.findOne({ where: { id: placeId } });

  if (!isFind) return res.status(404).send("Lugar no encontrado");

  await PlaceDelivery.update(req.body, {
    where: { id: placeId },
  });
  res.json({ success: `se ha modificado ${placeId}` });
});

/**
 * Deletes a place from the DB
 */
router.delete("/:placeId", async (req, res) => {
  const { placeId } = req.params;
  const isFind = await PlaceDelivery.findOne({ where: { id: placeId } });

  if (!isFind) return res.status(404).send("Lugar no encontrado");

  await PlaceDelivery.destroy({ where: { id: placeId } });
  res.status(200).send();
});

module.exports = router;
