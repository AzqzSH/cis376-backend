# Server

---

## Setup

-   Install [Node.js](https://nodejs.org/en/download/)

-   Run `yarn install` to install dependencies

-   Run `yarn dev` to start the server

## Routes

-   ### [Auth](src/controllers/AuthController.ts)

    -   POST `/auth/login` - Login

    -   POST `/auth/register` - Register

    -   GET `/auth/refresh-token` - Refresh token

        -   Query Params

            -   `refresh` - Refresh token

    -   GET `/auth/me` - Get user info

        -   Headers

            -   `Authorization` - Bearer token

-   ### [Locations](src/controllers/LocationsController.ts)

    -   GET `/locations` - Get all locations

        -   Headers

            -   `Authorization` - Bearer token

        -   Query Params

            -   `limit` - Limit
            -   `offset` - Offset

    -   GET `/locations/:id` - Get location by id

        -   Headers

            -   `Authorization` - Bearer token

## Contributing

-   Pull the latest changes from `master` branch

-   ...

## Workflow & Development

-   Code Example

    -   #### Controllers

    ```ts
    @Controller('/locations')
    export class LocationsController {
    	@Get('/')
    	async getLocations(
    		@Res() res: Response,
    		@Query('limit') limit: number = 10,
    		@Query('offset') offset: number = 0
    	) {
    		const locations = await prisma.location.findMany({
    			take: limit,
    			skip: offset,
    		});

    		res.send(locations);
    	}
    }
    ```

    -   Explanation

        -   Here, /locations is the base route for all the routes in the controller
        -   @Get('/') is the route for the function
        -   @Res() is the response object
        -   @Query('limit') is the query parameter
        -   @Query('offset') is the query parameter
        -   res.send(locations) is the response

        -   **So, /locations/ will return all the locations**

    -   Example callings:

        -   /locations?limit=10&offset=0 (default)
        -   /locations?limit=10&offset=10 (next page)
        -   /locations?limit=10&offset=20 (next page)
        -   ...

    -   Any new controller should be added to the [controllers](src/controllers/index.ts) file, and then imported in the [main entrypoint](src/index.ts) file

        ```ts
        attachControllers(app, [
        	LocationsController,
        	AuthController,
        	...AnyNewController,
        ]);
        ```

    -   #### Services

    ```ts
    @Injectable()
    export class AuthService {
    	// Any code herre
    }
    ```

    -   Here, @Injectable() is a decorator that makes the class injectable

    -   Example usage:

        ```ts
        @Controller('/auth')
        class AuthController {
        	constructor(private authService: AuthService) {}

        	// Any code here
        }
        ```

        -   Here, private authService: AuthService is a dependency injection
        -   It will automatically inject the AuthService class into the AuthController class

    -   #### [Models (Prisma)](prisma/schema.prisma)

    ```ts
    model Location {
        id        String   @id @default(uuid())
        name      String
        latitude  Float
        longitude Float
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
    }
    ```
