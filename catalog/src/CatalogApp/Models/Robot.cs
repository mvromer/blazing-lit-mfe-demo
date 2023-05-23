namespace CatalogApp.Models;

enum Quality
{
    New,
    Functioning,
    Salvage
}

record class Robot(string Name, uint Price, Quality Quality, string Description, string ImageUrl);
