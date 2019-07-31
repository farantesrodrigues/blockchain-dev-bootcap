import { TestBed } from '@angular/core/testing';

import { Web3Service } from './contract.service';

describe('ContractService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3Service = TestBed.get(Web3Service);
    expect(service).toBeTruthy();
  });
});
