export interface EVModel {
    id: string
    make: string
    model: string
    trim?: string
    capacity: number
    type: "sedan" | "suv" | "truck" | "hatchback"
    image?: string
}

export const EV_DATABASE: EVModel[] = [
    // Tesla
    { id: "tesla-m3-rwd", make: "Tesla", model: "Model 3", trim: "RWD (LFP)", capacity: 57.5, type: "sedan", image: "/assets/avatars/sedan.png" },
    { id: "tesla-m3-lr", make: "Tesla", model: "Model 3", trim: "Long Range / Perf", capacity: 75.0, type: "sedan", image: "/assets/avatars/sedan.png" },
    { id: "tesla-my-rwd", make: "Tesla", model: "Model Y", trim: "RWD", capacity: 60.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "tesla-my-lr", make: "Tesla", model: "Model Y", trim: "Long Range / Perf", capacity: 75.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "tesla-ms-lr", make: "Tesla", model: "Model S", trim: "Long Range", capacity: 100.0, type: "sedan", image: "/assets/avatars/sedan.png" },
    { id: "tesla-mx-lr", make: "Tesla", model: "Model X", trim: "Long Range", capacity: 100.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "tesla-ct", make: "Tesla", model: "Cybertruck", trim: "AWD", capacity: 123.0, type: "truck", image: "/assets/avatars/truck.png" },

    // Hyundai / Kia
    { id: "hyundai-ioniq5-lr", make: "Hyundai", model: "Ioniq 5", trim: "Long Range", capacity: 77.4, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "hyundai-ioniq5-sr", make: "Hyundai", model: "Ioniq 5", trim: "Standard Range", capacity: 58.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "hyundai-ioniq6-lr", make: "Hyundai", model: "Ioniq 6", trim: "Long Range", capacity: 77.4, type: "sedan", image: "/assets/avatars/sedan.png" },
    { id: "kia-ev6-lr", make: "Kia", model: "EV6", trim: "Long Range", capacity: 77.4, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "kia-ev9-lr", make: "Kia", model: "EV9", trim: "Long Range", capacity: 99.8, type: "suv", image: "/assets/avatars/suv.png" },

    // Ford
    { id: "ford-mache-ext", make: "Ford", model: "Mustang Mach-E", trim: "Extended Range", capacity: 91.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "ford-mache-std", make: "Ford", model: "Mustang Mach-E", trim: "Standard Range", capacity: 72.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "ford-f150-ext", make: "Ford", model: "F-150 Lightning", trim: "Extended Range", capacity: 131.0, type: "truck", image: "/assets/avatars/truck.png" },
    { id: "ford-f150-std", make: "Ford", model: "F-150 Lightning", trim: "Standard Range", capacity: 98.0, type: "truck", image: "/assets/avatars/truck.png" },

    // Nissan
    { id: "nissan-leaf-40", make: "Nissan", model: "Leaf", trim: "40 kWh", capacity: 40.0, type: "hatchback", image: "/assets/avatars/hatchback.png" },
    { id: "nissan-leaf-62", make: "Nissan", model: "Leaf e+", trim: "62 kWh", capacity: 62.0, type: "hatchback", image: "/assets/avatars/hatchback.png" },
    { id: "nissan-ariya-87", make: "Nissan", model: "Ariya", trim: "87 kWh", capacity: 87.0, type: "suv", image: "/assets/avatars/suv.png" },

    // VW / Audi / Porsche
    { id: "vw-id4-pro", make: "Volkswagen", model: "ID.4", trim: "Pro", capacity: 82.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "vw-id4-std", make: "Volkswagen", model: "ID.4", trim: "Standard", capacity: 62.0, type: "suv", image: "/assets/avatars/suv.png" },
    { id: "audi-etron-gt", make: "Audi", model: "e-tron GT", capacity: 93.4, type: "sedan", image: "/assets/avatars/sedan.png" },
    { id: "porsche-taycan-perf", make: "Porsche", model: "Taycan", trim: "Perf Battery Plus", capacity: 93.4, type: "sedan", image: "/assets/avatars/sedan.png" },

    // Rivian
    { id: "rivian-r1t-large", make: "Rivian", model: "R1T", trim: "Large Pack", capacity: 135.0, type: "truck", image: "/assets/avatars/truck.png" },
    { id: "rivian-r1s-large", make: "Rivian", model: "R1S", trim: "Large Pack", capacity: 135.0, type: "suv", image: "/assets/avatars/suv.png" },

    // Chevrolet
    { id: "chevy-bolt", make: "Chevrolet", model: "Bolt EV/EUV", capacity: 66.0, type: "hatchback", image: "/assets/avatars/hatchback.png" },
    { id: "chevy-blazer", make: "Chevrolet", model: "Blazer EV", trim: "RS AWD", capacity: 85.0, type: "suv", image: "/assets/avatars/suv.png" },

    // BMW
    { id: "bmw-i4-e40", make: "BMW", model: "i4", trim: "eDrive40", capacity: 80.7, type: "sedan", image: "/assets/avatars/sedan.png" },
    { id: "bmw-ix-50", make: "BMW", model: "iX", trim: "xDrive50", capacity: 105.2, type: "suv", image: "/assets/avatars/suv.png" },
]
