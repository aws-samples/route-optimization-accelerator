/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
// TODO: this is just a sample
import { Optimization } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";

export const EXAMPLES: {
  [k: string]: { description: string; value: Partial<Optimization> };
} = {
  type1: {
    description: "Traveling Salesman With ServiceWindow",
    value: {
      fleet: [
        {
          id: "fleet-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
        },
      ],
      orders: [
        {
          id: "order-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.44698579335265,
            longitude: -122.24363815840434,
            id: "customer-1",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.66652384516118,
            longitude: -122.37044619357494,
            id: "customer-2",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.23394925508806,
            longitude: -122.4258670753003,
            id: "customer-3",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.656237058705756,
            longitude: -122.28922645931934,
            id: "customer-4",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
      ],
    },
  },
  type2: {
    description: "Traveling Salesman With ServiceWindow and Requirements",
    value: {
      fleet: [
        {
          id: "fleet-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          attributes: ["electrician"],
        },
        {
          id: "fleet-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          attributes: ["plumber"],
        },
      ],
      orders: [
        {
          id: "order-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.44698579335265,
            longitude: -122.24363815840434,
            id: "customer-1",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          requirements: ["electrician"],
        },
        {
          id: "order-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.66652384516118,
            longitude: -122.37044619357494,
            id: "customer-2",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          requirements: ["electrician"],
        },
        {
          id: "order-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.23394925508806,
            longitude: -122.4258670753003,
            id: "customer-3",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          requirements: ["plumber"],
        },
        {
          id: "order-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.656237058705756,
            longitude: -122.28922645931934,
            id: "customer-4",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          requirements: ["plumber"],
        },
      ],
    },
  },
  type3: {
    description: "Traveling Salesman With Order Limits",
    value: {
      fleet: [
        {
          id: "fleet-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxOrders: 5 },
        },
        {
          id: "fleet-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxOrders: 5 },
        },
      ],
      orders: [
        {
          id: "order-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.33720851054882,
            longitude: -122.26368392598769,
            id: "customer-1",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.644493269573644,
            longitude: -122.12209048284853,
            id: "customer-2",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "order-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.180551614466495,
            longitude: -122.49039634449352,
            id: "customer-3",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "order-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.48474218321278,
            longitude: -122.51156768331305,
            id: "customer-4",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-5",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.415043866848364,
            longitude: -122.06601348618348,
            id: "customer-5",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "order-6",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.5927634735315,
            longitude: -122.15320346152487,
            id: "customer-6",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-7",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.21078542623956,
            longitude: -122.49676208743786,
            id: "customer-7",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-8",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.24118788803895,
            longitude: -122.20461783840966,
            id: "customer-8",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
        },
        {
          id: "order-9",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.34489116563586,
            longitude: -122.52815463558721,
            id: "customer-9",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "order-10",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.60633564024941,
            longitude: -122.07565413989126,
            id: "customer-10",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
      ],
    },
  },
  type4: {
    description: "Vehicle Routing with Fleet limits",
    value: {
      fleet: [
        {
          id: "fleet-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 150.0, maxVolume: 4.0 },
        },
        {
          id: "fleet-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 180.0, maxVolume: 5.0 },
        },
        {
          id: "fleet-3",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 180.0, maxVolume: 6.0 },
        },
      ],
      orders: [
        {
          id: "order-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.36347334902633,
            longitude: -122.3965745650439,
            id: "customer-1",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 0.5 },
        },
        {
          id: "order-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.30776300716571,
            longitude: -122.09088639805097,
            id: "customer-2",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
        },
        {
          id: "order-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.44511728936691,
            longitude: -122.55241750226665,
            id: "customer-3",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 2.0 },
        },
        {
          id: "order-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.376414542772636,
            longitude: -122.24980744873946,
            id: "customer-4",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
        },
        {
          id: "order-5",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.54594082969532,
            longitude: -122.31914362616507,
            id: "customer-5",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 30.0, volume: 2.0 },
        },
        {
          id: "order-6",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.43498937166692,
            longitude: -122.14234741610218,
            id: "customer-6",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
        },
        {
          id: "order-7",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.66335654652917,
            longitude: -122.52234077951786,
            id: "customer-7",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 1.0 },
        },
        {
          id: "order-8",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.40277582621401,
            longitude: -122.49209628301558,
            id: "customer-8",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 0.5 },
        },
        {
          id: "order-9",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.34001398655749,
            longitude: -122.3889318275432,
            id: "customer-9",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
        },
        {
          id: "order-10",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.47839199069655,
            longitude: -122.12884576773119,
            id: "customer-10",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
        },
      ],
    },
  },
  type5: {
    description: "Vehicle Routing with Fleet limits and Virtual Vehicles",
    value: {
      fleet: [
        {
          id: "fleet-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 150.0, maxVolume: 4.0 },
        },
      ],
      orders: [
        {
          id: "order-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.47079322990757,
            longitude: -122.28736766371803,
            id: "customer-1",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
        },
        {
          id: "order-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.613126207603486,
            longitude: -122.06897028906292,
            id: "customer-2",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 2.0 },
        },
        {
          id: "order-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.24289670524391,
            longitude: -122.49929730543307,
            id: "customer-3",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
        },
        {
          id: "order-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.221614789717414,
            longitude: -122.07920362737032,
            id: "customer-4",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 50.0, volume: 0.5 },
        },
        {
          id: "order-5",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.66949609125506,
            longitude: -122.17380860640549,
            id: "customer-5",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 0.5 },
        },
        {
          id: "order-6",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.581850727596695,
            longitude: -122.19550745669859,
            id: "customer-6",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
        },
        {
          id: "order-7",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.236497714383695,
            longitude: -122.11195879367425,
            id: "customer-7",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 2.0 },
        },
        {
          id: "order-8",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.530167816325154,
            longitude: -122.2009346306088,
            id: "customer-8",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 2.0 },
        },
        {
          id: "order-9",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.2049412047283,
            longitude: -122.56184535320087,
            id: "customer-9",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
        },
        {
          id: "order-10",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.65980508495745,
            longitude: -122.13205801009057,
            id: "customer-10",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 20.0, volume: 2.0 },
        },
        {
          id: "order-11",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.27876268006189,
            longitude: -122.47411408177618,
            id: "customer-11",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 0.5 },
        },
        {
          id: "order-12",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.558611419387496,
            longitude: -122.21604939726845,
            id: "customer-12",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 0.5 },
        },
        {
          id: "order-13",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.646557259216365,
            longitude: -122.17039985389312,
            id: "customer-13",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 2.0 },
        },
        {
          id: "order-14",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.56605536184598,
            longitude: -122.13485621033556,
            id: "customer-14",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 0.5 },
        },
        {
          id: "order-15",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.65501508624408,
            longitude: -122.47848623406838,
            id: "customer-15",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 30.0, volume: 0.5 },
        },
        {
          id: "order-16",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.391894531855094,
            longitude: -122.15968978285692,
            id: "customer-16",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 1.0 },
        },
        {
          id: "order-17",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.67011274956461,
            longitude: -122.31180245244171,
            id: "customer-17",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 50.0, volume: 0.5 },
        },
        {
          id: "order-18",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.20500453277869,
            longitude: -122.54033752524744,
            id: "customer-18",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 1.0 },
        },
        {
          id: "order-19",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.66868464030714,
            longitude: -122.07545146476792,
            id: "customer-19",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
        },
        {
          id: "order-20",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.32504903316735,
            longitude: -122.43563485379424,
            id: "customer-20",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 1.0 },
        },
        {
          id: "order-21",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.34763674732539,
            longitude: -122.55898477345137,
            id: "customer-21",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
        },
        {
          id: "order-22",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.32440972137601,
            longitude: -122.56225192795984,
            id: "customer-22",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 20.0, volume: 2.0 },
        },
        {
          id: "order-23",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.61063959741595,
            longitude: -122.4247328385497,
            id: "customer-23",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 2.0 },
        },
        {
          id: "order-24",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.49564697397602,
            longitude: -122.54173278486205,
            id: "customer-24",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 30.0, volume: 2.0 },
        },
        {
          id: "order-25",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.35395788877639,
            longitude: -122.30232359771306,
            id: "customer-25",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 2.0 },
        },
      ],
      config: {
        virtualFleet: [
          {
            groupId: "g1",
            size: 10,
            startingLocation: {
              latitude: 47.58758077964066,
              longitude: -122.24411681313705,
              id: "depot",
            },
            preferredDepartureTime: "2024-02-11T07:00:00",
            backToOrigin: true,
            limits: { maxCapacity: 120.0, maxVolume: 10.0 },
          },
        ],
      },
    },
  },
  type6: {
    description: "Vehicle Routing with Fleet limits and Requirements",
    value: {
      fleet: [
        {
          id: "fleet-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 150.0, maxVolume: 4.0 },
          attributes: ["frozen"],
        },
        {
          id: "fleet-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 180.0, maxVolume: 5.0 },
          attributes: ["frozen"],
        },
        {
          id: "fleet-3",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 180.0, maxVolume: 6.0 },
          attributes: ["chill"],
        },
        {
          id: "fleet-4",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
          limits: { maxCapacity: 100.0, maxVolume: 6.0 },
          attributes: ["chill"],
        },
      ],
      orders: [
        {
          id: "order-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.66652384516118,
            longitude: -122.37044619357494,
            id: "customer-1",
          },
          serviceTime: 3600,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
          requirements: ["frozen"],
        },
        {
          id: "order-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.23394925508806,
            longitude: -122.4258670753003,
            id: "customer-2",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
          requirements: ["frozen"],
        },
        {
          id: "order-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.656237058705756,
            longitude: -122.28922645931934,
            id: "customer-3",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 0.5 },
          requirements: ["frozen"],
        },
        {
          id: "order-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.561137963208076,
            longitude: -122.35757223976232,
            id: "customer-4",
          },
          serviceTime: 2700,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
          requirements: ["frozen"],
        },
        {
          id: "order-5",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.53932578104538,
            longitude: -122.18892677855891,
            id: "customer-5",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 2.0 },
          requirements: ["frozen"],
        },
        {
          id: "order-6",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.623310814018126,
            longitude: -122.29930175432254,
            id: "customer-6",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 20.0, volume: 1.0 },
          requirements: ["chill"],
        },
        {
          id: "order-7",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.53387026131235,
            longitude: -122.07212113102531,
            id: "customer-7",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 30.0, volume: 0.5 },
          requirements: ["chill"],
        },
        {
          id: "order-8",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.1710745223993,
            longitude: -122.3313479244388,
            id: "customer-8",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 50.0, volume: 1.0 },
          requirements: ["chill"],
        },
        {
          id: "order-9",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.6031066205296,
            longitude: -122.39378366574466,
            id: "customer-9",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T12:00:00",
            to: "2024-02-11T18:00:00",
          },
          attributes: { weight: 20.0, volume: 2.0 },
          requirements: ["chill"],
        },
        {
          id: "order-10",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.259264009299855,
            longitude: -122.25612464688653,
            id: "customer-10",
          },
          serviceTime: 3000,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T12:00:00",
          },
          attributes: { weight: 30.0, volume: 0.5 },
          requirements: ["chill"],
        },
      ],
    },
  },
  type7: {
    description: "Traveling Salesman with maximum distance",
    value: {
      fleet: [
        {
          id: "f-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
        },
        {
          id: "f-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
        },
      ],
      orders: [
        {
          id: "o-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.59338774117188,
            longitude: -122.29313726917279,
            id: "v-1",
          },
          serviceTime: 30,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "o-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.579783230841144,
            longitude: -122.29374593376701,
            id: "v-2",
          },
          serviceTime: 30,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "o-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.59517145091249,
            longitude: -122.30555048763311,
            id: "v-3",
          },
          serviceTime: 30,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "o-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.588993143919,
            longitude: -122.30107828728701,
            id: "v-4",
          },
          serviceTime: 30,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
      ],
      config: { maxDistance: 15 * 1000 },
    },
  },
  type8: {
    description: "Traveling Salesman with maximum Duration",
    value: {
      fleet: [
        {
          id: "f-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
        },
        {
          id: "f-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          preferredDepartureTime: "2024-02-11T07:00:00",
          backToOrigin: true,
        },
      ],
      orders: [
        {
          id: "o-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.59338774117188,
            longitude: -122.29313726917279,
            id: "v-1",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "o-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.579783230841144,
            longitude: -122.29374593376701,
            id: "v-2",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "o-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.59517145091249,
            longitude: -122.30555048763311,
            id: "v-3",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
        {
          id: "o-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.588993143919,
            longitude: -122.30107828728701,
            id: "v-4",
          },
          serviceTime: 1800,
          serviceWindow: {
            from: "2024-02-11T07:00:00",
            to: "2024-02-11T18:00:00",
          },
        },
      ],
      config: { maxTime: 5400 },
    },
  },
  type9: {
    description: "Traveling Salesman without time window",
    value: {
      fleet: [
        {
          id: "f-1",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          backToOrigin: false,
          limits: { maxOrders: 1 },
        },
        {
          id: "f-2",
          startingLocation: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          backToOrigin: false,
          limits: { maxOrders: 3 },
        },
      ],
      orders: [
        {
          id: "o-1",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.59338774117188,
            longitude: -122.29313726917279,
            id: "v-1",
          },
        },
        {
          id: "o-2",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.579783230841144,
            longitude: -122.29374593376701,
            id: "v-2",
          },
        },
        {
          id: "o-3",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.59517145091249,
            longitude: -122.30555048763311,
            id: "v-3",
          },
        },
        {
          id: "o-4",
          origin: {
            latitude: 47.58758077964066,
            longitude: -122.24411681313705,
            id: "depot",
          },
          destination: {
            latitude: 47.588993143919,
            longitude: -122.30107828728701,
            id: "v-4",
          },
        },
      ],
    },
  },
};
