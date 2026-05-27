export type Language = 'en' | 'ko';

export const translations = {
  en: {
    appTitle: 'VPL Engine SIM',
    appSubtitle: 'MOC/CFD-Corrected 1D Isentropic Nozzle Flow Optimization Sim',
    inputs: 'Inputs',
    keyOutputs: 'Key Outputs',
    compact: 'Compact',
    detailed: 'Detailed',
    validation: 'Validation',
    engineControl: 'Engine Control',
    engineStatus: 'Engine Status',
    running: 'COMBUSTION',
    cutoff: 'CUTOFF',
    ignite: 'IGNITE',
    shutdown: 'CUTOFF',
    ignitionArmed: 'Ignition bus armed',
    ignitionSafe: 'Ignition bus safe',
    sound: 'Sound',
    soundOn: 'SOUND ON',
    soundOff: 'SOUND OFF',
    flowField: 'Flow Field',
    flowFieldModes: {
      off: 'OFF',
      mach: 'MACH',
      pressure: 'PRESS',
      temperature: 'TEMP',
      velocity: 'VEL',
    },
    flowFieldView: 'View',
    flowFieldViewModes: {
      slice: 'SLICE',
      volume: '3D',
    },
    flowFieldLegend: {
      mach: 'Mach number field',
      pressure: 'Static pressure field',
      temperature: 'Static temperature field',
      velocity: 'Axial velocity field',
    },
    flowFieldDescriptions: {
      off: 'No CFD field overlay is shown.',
      mach: 'Mach number shows local flow speed divided by local speed of sound. Higher values mean stronger supersonic expansion.',
      pressure:
        'Static pressure shows the local gas pressure after expansion. A large exit-to-ambient mismatch indicates overexpanded or underexpanded flow.',
      temperature:
        'Static temperature shows thermal energy remaining in the gas. It drops as pressure energy converts into velocity.',
      velocity:
        'Axial velocity shows how fast exhaust moves along the nozzle and plume centerline.',
    },
    reset: 'RESET',
    close: 'Close',
    matchTargetPerformance: 'MATCH TARGET PERFORMANCE',
    matchingTargetPerformance: 'DESIGNING...',
    targetDesignComplete: 'Target design complete',
    optimizationInfoButtonLabel: 'Open nozzle optimization explanation',
    optimizationInfoTitle: 'Nozzle Optimization Algorithm',
    optimizationInfoSections: [
      {
        title: '1. Exit area from isentropic flow',
        body: [
          'For each candidate exit area, the model computes the expansion ratio Ae/At, solves the supersonic area-Mach relation, and derives exit pressure from chamber pressure.',
          'The first objective is pressure matching: the optimizer favors a nozzle whose calculated exit pressure is close to ambient pressure. This avoids simply making the nozzle bigger to inflate thrust.',
        ],
      },
      {
        title: '2. Bell length and contour efficiency',
        body: [
          'The bell length ratio represents a Rao-style bell nozzle length compared with a 15 degree conical reference nozzle. Shorter bells reduce length and mass but lose contour efficiency if shortened too far.',
          'The rendered nozzle uses a simplified Rao bell contour: entrance and exit wall angles define a smooth polynomial bell that changes with the selected length ratio and exit area.',
        ],
      },
      {
        title: '3. CFD and manufacturing corrections',
        body: [
          'CFD efficiency and combustion efficiency multiply the ideal momentum thrust to represent viscous loss, nonuniform flow, finite-rate chemistry, and combustion quality.',
          'Wall thickness, material density, lattice mass factor, and yield strength estimate nozzle mass and thin-wall hoop-stress safety factor. Unsafe low-margin geometry is penalized heavily.',
        ],
      },
      {
        title: '4. Search objective',
        body: [
          'MATCH TARGET PERFORMANCE changes throat area, exit area, bell length ratio, and wall thickness to fit target thrust, target specific impulse, maximum nozzle mass, and minimum structural safety factor.',
          'The score combines exit-pressure mismatch, flow-separation risk, contour-efficiency loss, structural safety margin, length ratio, estimated nozzle mass, overexpansion penalty, and negative pressure-thrust penalty. The strongest penalties push the result away from negative pressure thrust and overexpanded flow.',
          'This is a preliminary design optimizer, not a replacement for a validated MOC contour generator, reacting-flow CFD, thermal analysis, or structural qualification.',
        ],
      },
    ],
    inputGroups: {
      target: 'Target Performance',
      operating: 'Operating Conditions',
      design: 'Nozzle Geometry',
      environment: 'Ambient Conditions',
      gas: 'Gas and Combustion Model',
      cfd: 'Loss Corrections',
      manufacturing: 'Manufacturing Model',
    },
    language: 'Language',
    english: 'English',
    korean: '한국어',
    validationOk: 'Current inputs satisfy the basic 1D model checks.',
    inputPanelLabel: 'Input panel',
    range: 'Range',
    modelDependent: 'model-dependent',
    noFixedMaximum: 'no fixed maximum',
    inputLabels: {
      chamberPressure: 'Chamber Total Pressure',
      chamberTemperature: 'Chamber Total Temperature',
      ambientPressure: 'Ambient Pressure',
      throatArea: 'Nozzle Throat Area',
      exitArea: 'Nozzle Exit Area',
      gamma: 'Specific Heat Ratio',
      gasConstant: 'Exhaust Gas Constant',
      combustionEfficiency: 'Combustion Efficiency',
      bellLengthPercent: 'Bell Length Ratio',
      cfdEfficiency: 'Flow-Loss Efficiency',
      wallThickness: 'Nozzle Wall Thickness',
      materialDensity: 'Material Density',
      latticeMassFactor: 'Remaining Mass Ratio',
      yieldStrength: 'Yield Strength',
      targetThrust: 'Target Thrust',
      targetSpecificImpulse: 'Target Specific Impulse',
      maxNozzleMass: 'Maximum Nozzle Mass',
      minStructuralSafetyFactor: 'Minimum Structural Safety Factor',
    },
    inputDescriptions: {
      chamberPressure:
        'Total pressure in the combustion chamber used to drive choked mass flow and nozzle expansion.',
      chamberTemperature:
        'Total gas temperature in the chamber before expansion through the nozzle.',
      ambientPressure:
        'External atmospheric pressure used for pressure thrust, pressure matching, and flow-separation checks.',
      throatArea:
        'Minimum nozzle cross-sectional area. It controls choked mass flow and chamber discharge rate.',
      exitArea:
        'Nozzle exit cross-sectional area. Together with throat area it sets expansion ratio and exit pressure.',
      gamma:
        'Input specific heat ratio. The solver converts it into an effective gamma using a simplified frozen/equilibrium correction.',
      gasConstant:
        'Specific gas constant of the exhaust mixture used in mass-flow and velocity equations.',
      combustionEfficiency:
        'Momentum-thrust correction for incomplete combustion and nonideal heat release.',
      bellLengthPercent:
        'Rao-style bell length as a percentage of the equivalent 15 degree conical nozzle length.',
      cfdEfficiency:
        'Loss correction for viscous effects, nonuniform flow, and finite-rate flow-field behavior.',
      wallThickness:
        'Equivalent pressure-vessel wall thickness used for nozzle/chamber mass and hoop-stress safety calculations. The range is intentionally conservative for manufacturable hardware.',
      materialDensity:
        'Material density used to estimate nozzle structural mass.',
      latticeMassFactor:
        'Remaining mass percentage after lightweight lattice or infill reduction.',
      yieldStrength:
        'Material yield strength used to estimate structural safety factor against thin-wall hoop stress.',
      targetThrust:
        'Desired total thrust. The target-matching optimizer adjusts nozzle geometry to approach this value.',
      targetSpecificImpulse:
        'Desired specific impulse. The optimizer balances this target against thrust, mass, and safety constraints.',
      maxNozzleMass:
        'Upper mass target for the nozzle. Designs above this mass receive an optimization penalty.',
      minStructuralSafetyFactor:
        'Minimum acceptable thin-wall hoop-stress safety factor for target matching.',
    },
    outputLabels: {
      totalThrust: 'Total Thrust',
      specificImpulse: 'Specific Impulse',
      massFlow: 'Mass Flow',
      exitMach: 'Exit Mach',
      exitPressure: 'Exit Pressure',
      exitVelocity: 'Exit Velocity',
      characteristicVelocity: 'Characteristic Velocity',
      effectiveGamma: 'Effective Specific Heat Ratio',
      idealThrust: 'Ideal Vacuum-Model Thrust',
      momentumThrust: 'Loss-Corrected Momentum Thrust',
      pressureThrust: 'Pressure Thrust',
      thrustCoefficient: 'Thrust Coefficient',
      expansionRatio: 'Expansion Ratio',
      contourEfficiency: 'Bell Contour Efficiency',
      correctionEfficiency: 'Overall Efficiency Factor',
      nozzleLength: 'Bell Nozzle Length',
      conicalEquivalentLength: '15 deg Cone Equivalent Length',
      nozzleMass: 'Estimated Nozzle Mass',
      flowSeparationRatio: 'Flow Separation Ratio',
      flowSeparationRisk: 'Flow Separation Risk',
      structuralRadius: 'Structural Check Radius',
      wallThicknessRatio: 'Wall Thickness Ratio',
      estimatedWallTemperature: 'Estimated Wall Temperature',
      effectiveYieldStrength: 'Derated Yield Strength',
      hoopStress: 'Pressure Vessel Hoop Stress',
      structuralSafetyFactor: 'Structural Safety Factor',
    },
    outputDescriptions: {
      totalThrust:
        'Final thrust after loss-corrected momentum thrust and pressure thrust are combined.',
      specificImpulse:
        'Thrust per propellant weight-flow rate. Higher values mean more impulse for the same mass flow.',
      massFlow:
        'Choked propellant mass flow through the nozzle throat from the isentropic flow relation.',
      exitMach:
        'Supersonic Mach number at the nozzle exit solved from the area-Mach relation.',
      exitPressure:
        'Static pressure at the nozzle exit after isentropic expansion.',
      exitVelocity:
        'Gas velocity at the nozzle exit computed from exit Mach number and static temperature.',
      characteristicVelocity:
        'c-star performance metric linking chamber pressure, throat area, and mass flow.',
      effectiveGamma:
        'Temperature and expansion corrected effective specific heat ratio used by the solver.',
      idealThrust:
        'Ideal thrust before empirical loss corrections are applied to momentum thrust.',
      momentumThrust:
        'Mass flow multiplied by exit velocity after contour, CFD, and combustion corrections.',
      pressureThrust:
        'Additional thrust from nozzle exit pressure being different from ambient pressure.',
      thrustCoefficient:
        'Total thrust normalized by chamber pressure and throat area.',
      expansionRatio: 'Nozzle exit area divided by throat area.',
      contourEfficiency:
        'Estimated performance efficiency of the bell contour compared with ideal axial exit flow.',
      correctionEfficiency:
        'Combined contour, CFD-loss, and combustion efficiency multiplier.',
      nozzleLength:
        'Computed bell nozzle length from selected bell length ratio.',
      conicalEquivalentLength:
        'Reference divergent length for a 15 degree conical nozzle with the same throat and exit radii.',
      nozzleMass:
        'Estimated nozzle mass from wall area, wall thickness, material density, and remaining mass ratio.',
      flowSeparationRatio:
        'Exit pressure divided by ambient pressure. Values far below the separation limit indicate overexpanded flow.',
      flowSeparationRisk:
        'Risk score from a simplified Summerfield-style overexpansion separation threshold.',
      structuralRadius:
        'Representative inner radius used for the pressure-vessel check. It uses the larger of exit radius and an estimated chamber bore radius.',
      wallThicknessRatio:
        'Wall thickness divided by structural check radius. Below 0.1 uses thin-wall theory; thicker walls use Lamé thick-wall stress.',
      estimatedWallTemperature:
        'Estimated hot-wall temperature used to reduce material strength at elevated temperature.',
      effectiveYieldStrength:
        'Yield strength after thermal derating and lattice/lightweighting strength knockdown.',
      hoopStress:
        'Maximum circumferential pressure-vessel stress from chamber pressure, structural radius, and wall thickness.',
      structuralSafetyFactor:
        'Derated yield strength divided by pressure-vessel hoop stress.',
    },
    sceneLabels: {
      thrust: 'Thrust',
      expansion: 'Expansion',
      exitVelocity: 'Exit velocity',
    },
    validationMessages: {
      gamma: 'Specific heat ratio must be greater than 1.',
      temperature: 'Chamber temperature must be greater than 0 K.',
      areaRatio:
        'Exit area should be larger than throat area for a divergent nozzle.',
      massFlow:
        'Mass flow result is invalid. Check pressure, temperature, gamma, R, and throat area.',
      exitVelocity:
        'Exit velocity result is invalid. Check pressure ratio and thermodynamic inputs.',
      thrust: 'Thrust result is invalid. Check nozzle and pressure inputs.',
      chamberPressure: 'Chamber pressure must be greater than 0 Pa.',
      throatArea: 'Throat area must be greater than 0.',
      exitArea: 'Exit area must be greater than 0.',
      gasConstant: 'Gas constant must be greater than 0.',
      yieldStrength: 'Yield strength must be greater than 0 Pa.',
      flowSeparation:
        'Flow separation risk: exit pressure is too far below ambient pressure for the current overexpanded nozzle.',
      negativePressureThrust:
        'Pressure thrust is negative because nozzle exit pressure is below ambient pressure.',
      structuralMargin:
        'Structural margin is low. Thin-wall hoop-stress safety factor is below 1.5.',
      structuralFailure:
        'Structural failure risk: thin-wall hoop stress exceeds the selected material yield strength.',
    },
  },
  ko: {
    appTitle: 'VPL Engine SIM',
    appSubtitle: 'MOC 및 CFD 보정 모델을 적용한 1D 노즐 유동 최적화 시뮬레이터',
    inputs: '입력값',
    keyOutputs: '핵심 출력값',
    compact: '요약',
    detailed: '상세',
    validation: '검증',
    engineControl: '엔진 제어',
    engineStatus: '엔진 상태',
    running: '연소 중',
    cutoff: '연소 종료됨',
    ignite: '연소',
    shutdown: '연소 종료',
    ignitionArmed: '점화 회로 활성',
    ignitionSafe: '점화 회로 안전',
    sound: '소리',
    soundOn: '소리 켜짐',
    soundOff: '소리 꺼짐',
    flowField: '유동장',
    flowFieldModes: {
      off: 'OFF',
      mach: 'MACH',
      pressure: 'PRESS',
      temperature: 'TEMP',
      velocity: 'VEL',
    },
    flowFieldView: '보기',
    flowFieldViewModes: {
      slice: '단면',
      volume: '3D',
    },
    flowFieldLegend: {
      mach: '마하수 분포',
      pressure: '정압 분포',
      temperature: '정온도 분포',
      velocity: '축방향 속도 분포',
    },
    flowFieldDescriptions: {
      off: 'CFD 유동장 오버레이를 표시하지 않습니다.',
      mach: '마하수는 국소 유속을 국소 음속으로 나눈 값입니다. 값이 클수록 초음속 팽창이 강합니다.',
      pressure:
        '정압은 팽창 후 각 위치의 가스 압력입니다. 출구 정압과 대기압 차이가 크면 과팽창 또는 부족팽창 상태입니다.',
      temperature:
        '정온도는 유동 중인 가스에 남아 있는 열에너지 수준입니다. 압력 에너지가 속도로 바뀔수록 낮아집니다.',
      velocity:
        '축방향 속도는 배기가스가 노즐과 플룸 중심축 방향으로 이동하는 속도입니다.',
    },
    reset: '초기화',
    close: '닫기',
    matchTargetPerformance: '목표 성능 맞춤 설계',
    matchingTargetPerformance: '설계 계산 중...',
    targetDesignComplete: '목표 설계 완료',
    optimizationInfoButtonLabel: '노즐 최적화 알고리즘 설명 열기',
    optimizationInfoTitle: '노즐 최적화 알고리즘',
    optimizationInfoSections: [
      {
        title: '1. 등엔트로피 유동으로 출구 면적 평가',
        body: [
          '각 출구 면적 후보에 대해 팽창비 Ae/At를 계산하고, 초음속 면적-마하수 관계식을 풀어 출구 마하수와 출구 압력을 구합니다.',
          '첫 번째 목표는 출구 압력을 대기압에 가깝게 맞추는 것입니다. 이렇게 해야 단순히 노즐을 크게 만들어 추력만 키우는 방향으로 최적화되지 않습니다.',
        ],
      },
      {
        title: '2. 벨 길이와 형상 효율',
        body: [
          '벨 길이 비율은 15도 원추 노즐 길이를 기준으로 한 Rao 계열 벨 노즐의 상대 길이입니다. 짧은 벨은 길이와 질량을 줄이지만, 너무 짧으면 형상 효율이 떨어집니다.',
          '렌더링되는 노즐은 간소화된 Rao 벨 형상을 사용합니다. 입구 벽각과 출구 벽각을 기준으로 부드러운 다항식 벨 곡선을 만들고, 선택한 길이 비율과 출구 면적에 따라 곡률이 바뀝니다.',
        ],
      },
      {
        title: '3. CFD 및 제작 보정',
        body: [
          '유동 손실 효율과 연소 효율은 이상 운동량 추력에 곱해져 점성 손실, 비균일 유동, 유한 속도 화학 반응, 연소 품질 저하를 반영합니다.',
          '벽 두께, 재료 밀도, 잔류 질량 비율, 항복 강도는 노즐 질량과 얇은 벽 원통의 후프 응력 안전율을 추정하는 데 사용됩니다. 안전 여유가 낮은 형상은 크게 감점합니다.',
        ],
      },
      {
        title: '4. 탐색 목적 함수',
        body: [
          '목표 성능 맞춤 설계는 목표 추력, 목표 비추력, 최대 노즐 질량, 최소 구조 안전율을 만족하도록 노즐 목 면적, 출구 면적, 벨 길이 비율, 벽 두께를 함께 탐색합니다.',
          '점수는 출구압-대기압 차이, 유동 박리 위험, 형상 효율 손실, 구조 안전 여유, 길이 비율, 예상 노즐 질량, 과팽창 패널티, 음의 압력 추력 패널티를 합산합니다. 특히 음의 압력 추력과 과팽창 유동을 강하게 피하도록 가중치를 둡니다.',
          '이 기능은 예비 설계용 최적화입니다. 검증된 MOC 형상 생성, 반응 유동 CFD, 열 해석, 구조 검증을 대체하지 않습니다.',
        ],
      },
    ],
    inputGroups: {
      target: '목표 성능',
      operating: '운전 조건',
      design: '노즐 형상',
      environment: '대기 조건',
      gas: '가스/연소 모델',
      cfd: '손실 보정',
      manufacturing: '제작 모델',
    },
    language: '언어',
    english: 'English',
    korean: '한국어',
    validationOk: '현재 입력값은 기본 모델에 적합합니다.',
    inputPanelLabel: '입력 패널',
    range: '범위',
    modelDependent: '모델에 따라 달라짐',
    noFixedMaximum: '고정 상한 없음',
    inputLabels: {
      chamberPressure: '연소실 전압력',
      chamberTemperature: '연소실 전온도',
      ambientPressure: '대기압',
      throatArea: '노즐 목 면적',
      exitArea: '노즐 출구 면적',
      gamma: '비열비',
      gasConstant: '배기가스 기체상수',
      combustionEfficiency: '연소 효율',
      bellLengthPercent: '벨 노즐 길이 비율',
      cfdEfficiency: '유동 손실 효율',
      wallThickness: '노즐 벽 두께',
      materialDensity: '재료 밀도',
      latticeMassFactor: '잔류 질량 비율',
      yieldStrength: '항복 강도',
      targetThrust: '목표 추력',
      targetSpecificImpulse: '목표 비추력',
      maxNozzleMass: '최대 노즐 질량',
      minStructuralSafetyFactor: '최소 구조 안전율',
    },
    inputDescriptions: {
      chamberPressure:
        '초크 질량 유량과 노즐 팽창을 구동하는 연소실 내부 전압력입니다.',
      chamberTemperature: '노즐에서 팽창하기 전 연소실 내 가스의 전온도입니다.',
      ambientPressure:
        '압력 추력, 압력 매칭, 유동 박리 검토에 쓰이는 외부 대기압입니다.',
      throatArea:
        '노즐에서 가장 좁은 목 면적입니다. 초크 질량 유량과 배출량을 지배합니다.',
      exitArea:
        '노즐 출구 면적입니다. 목 면적과 함께 팽창비와 출구 압력을 결정합니다.',
      gamma:
        '입력 비열비입니다. 계산에서는 간소화된 동결/평형 보정을 거친 유효 비열비로 변환됩니다.',
      gasConstant:
        '질량 유량과 출구 유속 계산에 쓰이는 배기가스 혼합물의 기체상수입니다.',
      combustionEfficiency:
        '불완전 연소와 비이상적 열방출을 반영하는 운동량 추력 보정 계수입니다.',
      bellLengthPercent:
        '15도 원추 등가 노즐 길이에 대한 Rao 계열 벨 노즐 길이 비율입니다.',
      cfdEfficiency:
        '점성 손실, 비균일 유동, 유한 속도 유동장 효과를 반영하는 손실 보정 계수입니다.',
      wallThickness:
        '노즐/챔버 질량과 후프 응력 안전율 계산에 쓰는 압력용기 등가 벽 두께입니다. 제작 가능한 하드웨어 기준으로 보수적인 범위를 사용합니다.',
      materialDensity: '노즐 구조 질량 추정에 쓰이는 재료 밀도입니다.',
      latticeMassFactor:
        '격자 구조 또는 내부 채움률 감소 후 남는 질량 비율입니다.',
      yieldStrength:
        '얇은 벽 후프 응력 대비 구조 안전율을 추정하는 데 쓰이는 재료 항복 강도입니다.',
      targetThrust:
        '원하는 총추력입니다. 목표 성능 맞춤 설계는 이 값에 가까워지도록 노즐 형상을 조정합니다.',
      targetSpecificImpulse:
        '원하는 비추력입니다. 최적화는 추력, 질량, 안전 조건과 함께 이 목표를 균형 있게 맞춥니다.',
      maxNozzleMass:
        '노즐 질량의 목표 상한입니다. 이 질량을 넘는 설계는 최적화 점수에서 감점됩니다.',
      minStructuralSafetyFactor:
        '목표 성능 맞춤 설계에서 허용할 최소 얇은 벽 후프 응력 안전율입니다.',
    },
    outputLabels: {
      totalThrust: '총추력',
      specificImpulse: '비추력',
      massFlow: '질량 유량',
      exitMach: '출구 마하수',
      exitPressure: '출구 압력',
      exitVelocity: '출구 유속',
      characteristicVelocity: '특성 속도',
      effectiveGamma: '유효 비열비',
      idealThrust: '이상 모델 추력',
      momentumThrust: '손실 보정 운동량 추력',
      pressureThrust: '압력 추력',
      thrustCoefficient: '추력 계수',
      expansionRatio: '팽창비',
      contourEfficiency: '벨 형상 효율',
      correctionEfficiency: '전체 효율 계수',
      nozzleLength: '벨 노즐 길이',
      conicalEquivalentLength: '15도 원추 등가 길이',
      nozzleMass: '예상 노즐 질량',
      flowSeparationRatio: '유동 박리 압력비',
      flowSeparationRisk: '유동 박리 위험도',
      structuralRadius: '구조 검토 반지름',
      wallThicknessRatio: '벽 두께비',
      estimatedWallTemperature: '추정 벽면 온도',
      effectiveYieldStrength: '보정 항복 강도',
      hoopStress: '압력용기 후프 응력',
      structuralSafetyFactor: '구조 안전율',
    },
    outputDescriptions: {
      totalThrust:
        '손실 보정된 운동량 추력과 압력 추력을 합산한 최종 추력입니다.',
      specificImpulse:
        '추력을 추진제 중량 유량으로 나눈 값입니다. 같은 질량 유량에서 더 큰 임펄스를 내면 값이 커집니다.',
      massFlow:
        '등엔트로피 초크 유동식으로 계산한 노즐 목 통과 질량 유량입니다.',
      exitMach: '면적-마하수 관계식으로 구한 노즐 출구 초음속 마하수입니다.',
      exitPressure: '등엔트로피 팽창 후 노즐 출구에서의 정압입니다.',
      exitVelocity: '출구 마하수와 정온도로 계산한 노즐 출구 가스 속도입니다.',
      characteristicVelocity:
        '연소실 압력, 목 면적, 질량 유량을 연결하는 c-star 성능 지표입니다.',
      effectiveGamma:
        '온도와 팽창 상태를 반영해 보정한 계산용 유효 비열비입니다.',
      idealThrust:
        '운동량 추력에 경험적 손실 보정을 적용하기 전의 이상 추력입니다.',
      momentumThrust:
        '질량 유량과 출구 유속에 형상, CFD, 연소 보정을 적용한 운동량 추력입니다.',
      pressureThrust:
        '노즐 출구 압력과 대기압 차이에서 생기는 추가 추력입니다.',
      thrustCoefficient:
        '총추력을 연소실 압력과 노즐 목 면적으로 정규화한 값입니다.',
      expansionRatio: '노즐 출구 면적을 목 면적으로 나눈 값입니다.',
      contourEfficiency:
        '출구 유동을 축방향에 가깝게 정렬하는 벨 형상의 추정 효율입니다.',
      correctionEfficiency:
        '형상, 유동 손실, 연소 효율을 합친 전체 보정 계수입니다.',
      nozzleLength: '선택한 벨 길이 비율로 계산한 벨 노즐 길이입니다.',
      conicalEquivalentLength:
        '같은 목/출구 반지름을 갖는 15도 원추 노즐의 기준 발산부 길이입니다.',
      nozzleMass:
        '벽 면적, 벽 두께, 재료 밀도, 잔류 질량 비율로 추정한 노즐 질량입니다.',
      flowSeparationRatio:
        '출구 압력을 대기압으로 나눈 값입니다. 박리 한계보다 많이 낮으면 과팽창 유동입니다.',
      flowSeparationRisk:
        '간소화된 Summerfield 계열 과팽창 박리 기준으로 계산한 위험도입니다.',
      structuralRadius:
        '압력용기 구조 검토에 쓰는 대표 내경 반지름입니다. 출구 반지름과 추정 연소실 보어 반지름 중 큰 값을 사용합니다.',
      wallThicknessRatio:
        '벽 두께를 구조 검토 반지름으로 나눈 값입니다. 0.1 미만은 얇은 벽 이론, 그 이상은 Lamé 두꺼운 벽 응력을 사용합니다.',
      estimatedWallTemperature:
        '고온에서 재료 강도를 낮추기 위해 추정한 노즐/챔버 벽면 온도입니다.',
      effectiveYieldStrength:
        '온도에 따른 강도 저하와 격자/경량화 강도 저하를 반영한 항복 강도입니다.',
      hoopStress:
        '연소실 압력, 구조 검토 반지름, 벽 두께로 계산한 최대 원주 방향 압력용기 응력입니다.',
      structuralSafetyFactor:
        '보정 항복 강도를 압력용기 후프 응력으로 나눈 구조 안전율입니다.',
    },
    sceneLabels: {
      thrust: '추력',
      expansion: '팽창비',
      exitMach: '출구 마하수',
      exitPressure: '출구 압력',
      exitVelocity: '출구 유속',
    },
    validationMessages: {
      gamma: '비열비는 1보다 커야 합니다.',
      temperature: '연소실 온도는 0 K보다 커야 합니다.',
      areaRatio: '발산 노즐에서는 출구 면적이 목 면적보다 커야 합니다.',
      massFlow:
        '질량 유량 계산값이 유효하지 않습니다. 압력, 온도, 비열비, 기체 상수, 노즐 목 면적을 확인하세요.',
      exitVelocity:
        '출구 유속 계산값이 유효하지 않습니다. 압력비와 열역학 입력값을 확인하세요.',
      thrust:
        '추력 계산값이 유효하지 않습니다. 노즐 및 압력 입력값을 확인하세요.',
      chamberPressure: '연소실 압력은 0 Pa보다 커야 합니다.',
      throatArea: '노즐 목 면적은 0보다 커야 합니다.',
      exitArea: '노즐 출구 면적은 0보다 커야 합니다.',
      gasConstant: '기체 상수는 0보다 커야 합니다.',
      yieldStrength: '항복 강도는 0 Pa보다 커야 합니다.',
      flowSeparation:
        '유동 박리 위험: 현재 과팽창 노즐에서 출구 압력이 대기압보다 지나치게 낮습니다.',
      negativePressureThrust:
        '노즐 출구 압력이 대기압보다 낮아 압력 추력이 음수입니다.',
      structuralMargin:
        '구조 안전 여유가 낮습니다. 얇은 벽 후프 응력 기준 안전율이 1.5보다 작습니다.',
      structuralFailure:
        '구조 파손 위험: 얇은 벽 후프 응력이 선택한 재료 항복 강도를 초과합니다.',
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
