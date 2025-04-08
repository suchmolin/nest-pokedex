import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany(); // esto borra la base de datos de pokemon antes de insertar

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    const pokemonToInsert: { name: string; no: number }[] = data.results.map(
      ({ name, url }) => {
        const segment = url.split('/');
        const no = +segment[segment.length - 2];

        return { name, no };
      },
    );

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'SEED EXECUTED';
  }
}
