namespace CatalogApp.Models;

class RobotCatalog
{
    private readonly Dictionary<string, Robot> _robots;

    public RobotCatalog()
    {
        _robots = new()
        {
            {
                "jerry",
                new(
                    "Jerry",
                    3000,
                    Quality.New,
                    "Fully-configurable food processing bot",
                    "https://robohash.org/blazing-lit-mfe-demo-Jerry"
                )
            },
            {
                "mia",
                new(
                    "Mia",
                    2350,
                    Quality.Functioning,
                    "Discrete finite automaton",
                    "https://robohash.org/blazing-lit-mfe-demo-Mia"
                )
            },
            {
                "quentin",
                new(
                    "Quentin",
                    1300,
                    Quality.Salvage,
                    "Parallel task processor",
                    "https://robohash.org/blazing-lit-mfe-demo-Quentin"
                )
            },
            {
                "lonie",
                new(
                    "Lonie",
                    1700,
                    Quality.Functioning,
                    "Secured terraforming drone",
                    "https://robohash.org/blazing-lit-mfe-demo-Lonie"
                )
            },
            {
                "maximo",
                new(
                    "Maximo",
                    750,
                    Quality.Salvage,
                    "Versatile droid with unbeatable performance",
                    "https://robohash.org/blazing-lit-mfe-demo-Maximo"
                )
            }
        };
    }

    public Robot Get(string name) => _robots[name];

    public IEnumerable<Robot> GetRobots() => _robots.Values;
}
