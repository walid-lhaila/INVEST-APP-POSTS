import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class PostsDto {
  @IsString()
  @IsNotEmpty()
  entrepreneurId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum([
    'Technologie',
    'Santé',
    'Éducation',
    'Finance',
    'Environnement',
    'Industrie',
    'Autre',
  ])
  category: string;

  @IsArray()
  @IsString()
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @Min(1000)
  investmentGoal: number;

  @IsNumber()
  @IsOptional()
  currentInvestment?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsString()
  @IsOptional()
  likes?: string[];

  @IsNumber()
  @IsOptional()
  views?: number;

  @IsEnum(['Brouillon', 'Publié', 'Fermé'])
  @IsOptional()
  status?: string;
}
