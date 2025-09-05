# DeFi Trading Service
It's my cover-letter / Deveveloper diary. I hope it finds you in good shape.  **DevOps**, and **launch instructions** are **down below**! 

This is an **"enterprise" solution** for the test technical specification I was given. A microservice for fetching on-chain data and implementing Web3 Math. I built it following SOLID architecture principles with decoupling of concepts, layers, logging and more. This project is **created from scratch**, using best practices and experience I've earned throughout my professional life.

In this project **AI was used only for validation of ideas and some testing applications**. All the decisions, architecture, logic and codebase **was written by me personally**. Even though using AI to structurally access information is a modern way for getting it done in any field, I decided to avoid it to show my technical vision and ability to comprehend and build reliable, durable and robust systems.

## Development Process
This assignment was a simplified slice of a DeFi trading backend.
I treated it as a real enterprise service: structured DTOs, explicit request/response validation, Swagger docs, clean separation of infrastructure adapters <–> service <–> transport, robust config, custom logging, advanced exception handling.

In production systems, this approach scales into dozens of modules and hundreds of error types, but the principles stay the same: separation, observability, consistency.

So I tried to demonstrate how I design production-grade, maintainable systems even for small scopes. And I'm a fan of it. This is very far from ideal but in 2 days I built a nice foundation and a boilerplate for maintainable service:

- Minimalistic Docker + Docker Compose environment-separated + makefile
- Robust secure typed Config with validation
- Comprehensive Swagger documentation
- Comprehensive codebase documentation
- Custom logging module
- Transport (HTTP) layer
- Service domain layer
- Infrastructure adapters layer
- Idiomatic strictly-typed codebase
- Multi-layer typed and functional exception system
- Reliable typed Ethereum integration
- Lightweight Cron and catching system
- Unit Test Coverage of every critical function (even though non-critical are omitted)
- Cron and Scheduler base setup
- Robust Rest-API design

### Ethers.js V. Web3.js
For interaction with Ethereum Blockchain I chose to use Ethers.js. I have experience with both Ethers.js and Web3 on Backend and Frontend, but chose the former due to reliability.

### QuickNode V. Alchemy
They provide almost same services with similar pricing options. At first, I went with an alchemy, but caught myself in a situation where RPC requests were blocking processes. After some 30 minutes of console.logging I decided to ping it, they rate-limitted free accounts due to a highload. Quickly switched to Quicknode.

### Uniswap V2
I investigated the factory contract, learned its codebase, couple of view funcs calls and I undestood the thought-system. I went to Uniswap website, searched for a V2 pair contract, then hit its page on Etherscan. By that time, a workflow was pretty clear so I began coding business-logic.

##### AMM Formula
I fetched its variables but was struggling to come up with the structure of the expression. Although, pretty quickly found some useful information: first, on their resources, second, stackoverflow –– idea was taking a form, -- and finally I found a beautiful article explaning the AMM Formula in detail. So after careful read, I translated the formula into code. We were all set for the first try. It worked!

My result was off for ~0.25% all the time. I tried to tweak the formula around, but it didn't work. Then, I found their library and the original approach:

- https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol

It's still off for some pairs. My guess is there are more parameters on the UI than the library uses. I think there are hidden variables. My solution is pretty decent for the estimation task though.

### Gas price 
The gas price is an easy part (besides debugging Alchemy...). But response time <=50 ms? What do you think. I'm a senior. Right? Right. I know something about caching.

The real choice was whether to use redis or in-code service-level cache? Redis was clearly an overkill. It adds too much complexity in code and devops, and it takes something from this 50ms as well (2-5ms interprocess). Redis is a great shot when you need a complex, well-managed fast-memory system. Or for distributed processes to conviniently access same fast memory pool.

I created an env. variable for a simple TTL setting. Declared types, properties and a smart update method + logic to ensure there's no way it may slow down the process. I couldn't update it when the TTL's up on-demand because It'd broke the rule of 50ms, so I decided to launch a little dummy scheduler. It checks the update method every 1000ms and ensures our invisible customers always get up-to-date gas price for their shady financial manipulations :) Just kidding! they are nice fellas.

### Testing
I had a problem testing ethers.js, It was difficult to mock and always making some inevitable outbound calls. So I decided to introduce an infrastructure layer with adapters. Which I could easily mock. So I did it. 

### What's more?
I'd love to talk to you more, but it's rather some little project architecture decisions, boilerplate code, debbugging and refactoring here and there. Let's go to the DevOps and conclusion.

## Project setup

### Docker container & Docker Compose
```bash
# Docker compose line
docker-compose --env-file .env -f ./docker/dev/docker-compose.yaml up --build

# Makefile launch line
$ make dev-up
```

### Install dependencies
```bash
$ npm install
```

### Documentation
You can find Swagger documentation at the /docs route
```URL
https://localhost:3000/docs
```

### Environment variables
You can find .env reference in repository/.env.example. There's also a demo api key for the QuickNode RPC

```bash
$ cp .env.example .env
```

### Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Links & References
As I previously mentioned, this is a non-AI project. So during my work process I was collecting most useful links, based on which I implemented the business-logic

Uniswap V2 Factory Contract on Etherscan
- https://etherscan.io/address/0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f#readContract

Uniswap V2 Pair contract UI
- https://app.uniswap.org/explore/pools/ethereum/0x21b8065d10f73EE2e260e5B47D3344d3Ced7596E

Uniswap V2 pair contract code
- https://etherscan.io/address/0x21b8065d10f73ee2e260e5b47d3344d3ced7596e#readContract

Uniswap V2 AAM formula info
- https://ethereum.stackexchange.com/questions/151948/how-to-calculate-swap-price-from-a-uniswap-v2-swap-event-when-both-amount0in-and
- https://docs.uniswap.org/contracts/v2/overview
- https://www.quicknode.com/guides/defi/dexs/how-to-swap-tokens-on-uniswap-with-ethersjs
- https://rareskills.io/post/uniswap-v2-price-impact
- https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol

Ethers Alchemy Provider
- https://www.alchemy.com/docs/ethers-js-provider
