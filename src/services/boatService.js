import prisma from "../config/database.js";
import elasticsearchService from "./elasticsearchService.js";

class BoatService {
  async createBoat(boatData) {
    const { name, type, year } = boatData;

    const boat = await prisma.Boat.create({
      data: { name, type, year: parseInt(year) },
    });

    // Index the boat in Elasticsearch
    await elasticsearchService.indexBoat(boat);

    return boat;
  }

  async getAllBoats() {
    return await prisma.Boat.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        year: true,
      },
    });
  }

  async updateBoat(id, boatData) {
    const { name, type, year } = boatData;

    const boat = await prisma.Boat.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(year && { year: parseInt(year) }),
      },
    });

    // Update the boat in Elasticsearch
    await elasticsearchService.updateBoat(boat);

    return boat;
  }

  async deleteBoat(id) {
    await prisma.Boat.delete({
      where: { id },
    });

    // Delete the boat from Elasticsearch
    await elasticsearchService.deleteBoat(id);
  }

  async searchBoats(query, filters = {}) {
    const { type, year, yearMin, yearMax } = filters;

    const searchFilters = {};
    if (type) searchFilters.type = type;
    if (year) searchFilters.year = parseInt(year);
    if (yearMin || yearMax) {
      searchFilters.yearRange = {};
      if (yearMin) searchFilters.yearRange.min = parseInt(yearMin);
      if (yearMax) searchFilters.yearRange.max = parseInt(yearMax);
    }

    return await elasticsearchService.searchBoats(query, searchFilters);
  }
}

export default new BoatService();