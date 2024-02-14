namespace CatalogApp.Models;

enum Quality
{
    New,
    Functioning,
    Salvage
}

record class Robot(string Name, uint Price, Quality Quality, string Description, string ImageUrl)
{
    public static Robot Default = new("", 0, Quality.New, "", "");
}
