import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Header from '../components/header';
import Navigation from '../components/navigation';
import useFootprint from '../hooks/use-footprint';

type FormValues = {
  category: string;
  awd: string;
  reservedCarClass: string;
  elor: number;
  rentalZone: string;
  under24hRental: boolean;
  businessLeisure: boolean;
  localMarketIndicator: boolean;
  distributionChannel: string;
};

type CustomDataStepProps = {
  onboardingData: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onGoBack: () => void;
};

const CustomDataStep = ({ onboardingData, onSubmit, onGoBack }: CustomDataStepProps) => {
  const { save, process } = useFootprint();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category: onboardingData.category || '',
      awd: onboardingData.awd || '',
      reservedCarClass: onboardingData.reservedCarClass || '',
      elor: onboardingData.elor || 0,
      rentalZone: onboardingData.rentalZone || '',
      under24hRental: onboardingData.under24hRental || false,
      businessLeisure: onboardingData.businessLeisure || false,
      localMarketIndicator: onboardingData.localMarketIndicator || false,
      distributionChannel: onboardingData.distributionChannel || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      await save({
        'custom.category': data.category,
        'custom.awd': data.awd,
        'custom.reserved_car_class': data.reservedCarClass,
        'custom.elor': data.elor,
        'custom.rental_state': data.rentalZone,
        'custom.under_24h_rental': data.under24hRental,
        'custom.business_leisure': data.businessLeisure,
        'custom.local_market_indicator': data.localMarketIndicator,
        'custom.distribution_channel': data.distributionChannel,
      });
      await process();
      onSubmit(data);
    },
    onError: error => {
      console.error('Error saving data:', error);
    },
  });

  const onSubmitForm = async (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="app-form-overflow custom-data-step">
      <div style={{ marginLeft: 32 }}>
        <Navigation onClick={onGoBack} />
      </div>
      <Header title="Rental-related information" subtitle="Please provide additional information." />
      <form className="custom-data-form form" onSubmit={handleSubmit(onSubmitForm)}>
        <div className="form-content">
          <div className="form-field">
            <label className="form-label" htmlFor="category">
              Prestige category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="form-input"
              id="category"
            >
              <option value="">Select...</option>
              <option value="avis_preferred_plus_direct_connect">Avis preferred plus direct connect</option>
              <option value="chairmans_club_dynamic_tour">Chairmans club dynamic tour</option>
              <option value="none_expedia">None expedia</option>
              <option value="pref_renter_gds">Pref renter gds</option>
              <option value="president_club_no_res_walk_up">President club no res/walk up</option>
              <option value="standard_wizard_orbitz">Standard wizard orbitz</option>
              <option value="unknown">Unknown</option>
            </select>
            {errors.category && <p className="form-error">{errors.category.message}</p>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="awd">
              AWD
            </label>
            <select {...register('awd', { required: 'AWD is required' })} className="form-input" id="awd">
              <option value="">Select...</option>
              <option value="a_group_association">Group Association</option>
              <option value="b_bank_card_program">Bank Card Program</option>
              <option value="c_corporate">Corporate</option>
              <option value="d_triple_a_min_25_w_assoc_awd">Triple A Min 25 w/ Assoc AWD</option>
              <option value="f_field_association">Field Association</option>
              <option value="g_government">Government</option>
              <option value="h_insurance_replacement">Insurance Replacement</option>
              <option value="i_international">International</option>
              <option value="j_leisure_pass">Leisure Pass</option>
              <option value="k_competitive_awd">Competitive AWD</option>
              <option value="m_marketing">Marketing</option>
              <option value="non_awd">Non AWD</option>
              <option value="r_accmdn_avis_honr_cc_w_corp_awd">Accmdn Avis Honr CC w/ Corp AWD</option>
              <option value="s_telesales_corp_awd">Telesales Corp AWD</option>
              <option value="t_telesales_avischargecard">Telesales Avischargecard</option>
              <option value="u_convention_assoc_awd">Convention Assoc AWD</option>
              <option value="v_convention_corp_awd">Convention Corp AWD</option>
              <option value="z_touroverride">Touroverride</option>
            </select>
            {errors.awd && <p className="form-error">{errors.awd.message}</p>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="reservedCarClass">
              Reserved Car Class
            </label>
            <select
              {...register('reservedCarClass', { required: 'Reserved Car Class is required' })}
              className="form-input"
              id="reservedCarClass"
            >
              <option value="">Select...</option>
              <option value="-Z">-Z</option>
              <option value="6">6</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="H">H</option>
              <option value="I">I</option>
              <option value="J">J</option>
              <option value="K">K</option>
              <option value="L">L</option>
              <option value="P">P</option>
              <option value="S">S</option>
              <option value="V">V</option>
              <option value="W">W</option>
              <option value="X">X</option>
              <option value="Z">Z</option>
            </select>
            {errors.reservedCarClass && <p className="form-error">{errors.reservedCarClass.message}</p>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="elor">
              Estimated Length of Rental (ELOR)
            </label>
            <input
              {...register('elor', {
                required: 'Estimated Length of Rental is required',
                valueAsNumber: true,
                validate: value => value > 0 || 'ELOR must be a positive number',
              })}
              className="form-input"
              id="elor"
              type="number"
              placeholder="Type the estimated number of days"
            />
            {errors.elor && <p className="form-error">{errors.elor.message}</p>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="rentalZone">
              Rental Zone
            </label>
            <select
              {...register('rentalZone', { required: 'Rental Zone is required' })}
              className="form-input"
              id="rentalZone"
            >
              <option value="">Select...</option>
              <option value="aberdeen_sd">Aberdeen SD</option>
              <option value="alabama">Alabama</option>
              <option value="albuquerque">Albuquerque</option>
              <option value="alpena_mi">Alpena MI</option>
              <option value="anchorage_ak">Anchorage AK.</option>
              <option value="appleton_wi">Appleton WI</option>
              <option value="arizona_pool">Arizona Pool</option>
              <option value="atlanta_ga">Atlanta GA..</option>
              <option value="boston_mass">Boston Mass</option>
              <option value="buffalo_ny">Buffalo NY</option>
              <option value="cedar_rapids_ia">Cedar Rapids IA</option>
              <option value="charleston_sc">Charleston S.C.</option>
              <option value="charlotte">Charlotte</option>
              <option value="chicago_il">Chicago IL</option>
              <option value="cincinnati_city">Cincinnati City</option>
              <option value="cleveland_oh">Cleveland OH.</option>
              <option value="columbia_sc">Columbia S.C.</option>
              <option value="columbus_oh">Columbus OH.</option>
              <option value="dallas_zone">Dallas Zone</option>
              <option value="denver_co">Denver CO.</option>
              <option value="detroit_mi">Detroit MI.</option>
              <option value="dothan_al">Dothan AL</option>
              <option value="duluth_mn">Duluth MN.</option>
              <option value="fargo_nd">Fargo N.D.</option>
              <option value="florida">Florida</option>
              <option value="grand_forks_nd">Grand Forks ND</option>
              <option value="harrisburg_pa">Harrisburg PA.</option>
              <option value="hartford_ct">Hartford CT</option>
              <option value="hawaii_island">Hawaii Island</option>
              <option value="houston_admin">Houston Admin</option>
              <option value="indianapolis_flt">Indianapolis FLT</option>
              <option value="iron_mt_mi">Iron MT MI.</option>
              <option value="jamestown_nd">Jamestown N.D.</option>
              <option value="kansas_city">Kansas City</option>
              <option value="kauai_hawaii">Kauai Hawaii</option>
              <option value="knoxville_tn_lvl2">Knoxville TN LVL2</option>
              <option value="las_vegas_nv">Las Vegas NV</option>
              <option value="marthas_vineyard">Marthas Vineyard</option>
              <option value="maui_hawaii">Maui Hawaii</option>
              <option value="mccook_ne">McCook NE.</option>
              <option value="memphis_tn">Memphis TN.</option>
              <option value="minneapolis_mn">Minneapolis MN</option>
              <option value="minot_nd">Minot N.D.</option>
              <option value="mobile_al">Mobile AL</option>
              <option value="montgomery_al">Montgomery AL</option>
              <option value="n_california_ca">N California CA</option>
              <option value="nashville_tn_lvl2">Nashville TN LVL2</option>
              <option value="new_kensington_pa">New Kensington PA</option>
              <option value="new_orleans_la">New Orleans LA.</option>
              <option value="ny_operations">NY Operations</option>
              <option value="oahu_hawaii">Oahu Hawaii</option>
              <option value="ogden_ut">Ogden UT.</option>
              <option value="oklahoma_city_ok">Oklahoma City OK</option>
              <option value="page_owner_cars">Page-Owner-Cars</option>
              <option value="penn_hills_pa_02">Penn Hills PA 02</option>
              <option value="philadelphia_city">Philadelphia City</option>
              <option value="pierre_sd">Pierre S.D.</option>
              <option value="piscataway_nj">Piscataway NJ</option>
              <option value="pittsburgh_pa">Pittsburgh PA</option>
              <option value="portland_or">Portland OR.</option>
              <option value="presque_isle_me">Presque Isle ME.</option>
              <option value="pt_angeles_own_cr">PT Angeles-Own-CR</option>
              <option value="raleigh_durham">Raleigh Durham</option>
              <option value="rapid_city_sd">Rapid City SD</option>
              <option value="richmond_city_lv2">Richmond City LV2</option>
              <option value="s_calif">S. Calif.</option>
              <option value="salt_lake_city">Salt Lake City</option>
              <option value="san_antonio_tx">San Antonio TX.</option>
              <option value="seattle_wa">Seattle WA</option>
              <option value="sheridan_wy">Sheridan WY.</option>
              <option value="shreveport_la">Shreveport LA</option>
              <option value="sioux_city_ia">Sioux City IA</option>
              <option value="springfield_mo">Springfield MO.</option>
              <option value="st_george_utah">St. George Utah</option>
              <option value="st_louis_mo">St.Louis MO</option>
              <option value="st_simons_isle_ga">St.Simons Isle GA</option>
              <option value="uber_atlanta">Uber Atlanta</option>
              <option value="uber_austin">Uber Austin</option>
              <option value="uber_balt_wash">Uber Balt Wash</option>
              <option value="uber_boston">Uber Boston</option>
              <option value="uber_charlotte">Uber Charlotte</option>
              <option value="uber_chicago">Uber Chicago</option>
              <option value="uber_cincinnati">Uber Cincinnati</option>
              <option value="uber_cleveland">Uber Cleveland</option>
              <option value="uber_columbus">Uber Columbus</option>
              <option value="uber_dallas_lvl05">Uber Dallas LVL05</option>
              <option value="uber_denver">Uber Denver</option>
              <option value="uber_detroit">Uber Detroit</option>
              <option value="uber_ft_lauderdal">Uber Ft Lauderdal</option>
              <option value="uber_ft_myers_lv2">Uber Ft Myers LV2</option>
              <option value="uber_hartford_fo">Uber Hartford F/O</option>
              <option value="uber_honolulu">Uber Honolulu</option>
              <option value="uber_houston">Uber Houston</option>
              <option value="uber_indianapolis">Uber Indianapolis</option>
              <option value="uber_jacksonville">Uber Jacksonville</option>
              <option value="uber_kansas_city">Uber Kansas City</option>
              <option value="uber_las_vegas">Uber Las Vegas</option>
              <option value="uber_los_angeles">Uber Los Angeles</option>
              <option value="uber_louisville">Uber Louisville</option>
              <option value="uber_memphis">Uber Memphis</option>
              <option value="uber_miami">Uber Miami</option>
              <option value="uber_minn_fo">Uber Minn F/O</option>
              <option value="uber_nashville">Uber Nashville</option>
              <option value="uber_new_jersey">Uber New Jersey</option>
              <option value="uber_new_orleans">Uber New Orleans</option>
              <option value="uber_okc_level_2">Uber OKC Level 2</option>
              <option value="uber_orlando">Uber Orlando</option>
              <option value="uber_philadelphia">Uber Philadelphia</option>
              <option value="uber_phoenix_lvl5">Uber Phoenix LVL5</option>
              <option value="uber_pittsburgh">Uber Pittsburgh</option>
              <option value="uber_portlnd_lvl5">Uber Portlnd LVL5</option>
              <option value="uber_raleigh">Uber Raleigh</option>
              <option value="uber_richmond_cty">Uber Richmond CTY</option>
              <option value="uber_salt_lake">Uber Salt Lake</option>
              <option value="uber_san_antonio">Uber San Antonio</option>
              <option value="uber_san_diego">Uber San Diego</option>
              <option value="uber_san_fran">Uber San Fran</option>
              <option value="uber_savannah">Uber Savannah</option>
              <option value="uber_seattle_lvl">Uber Seattle LVL</option>
              <option value="uber_st_louis">Uber St Louis</option>
              <option value="uber_tampa_lv2">Uber Tampa LV2</option>
              <option value="uber_west_palm">Uber West Palm</option>
              <option value="valdosta_ga">Valdosta GA.</option>
              <option value="via_boston">Via Boston</option>
              <option value="via_dallas">Via Dallas</option>
              <option value="via_detroit_lv2">Via Detroit LV2</option>
              <option value="via_indnpls_lv2">Via Indnpls LV2</option>
              <option value="via_new_jersey">Via New Jersey</option>
              <option value="via_oklahoma_city">Via Oklahoma City</option>
              <option value="via_salt_lake_lv2">Via Salt Lake LV2</option>
              <option value="via_sea_lvl2">Via Sea LVL2</option>
              <option value="via_silicon_vally">Via Silicon Vally</option>
              <option value="via_st_louis_lv2">Via St Louis LV2</option>
              <option value="via_van_florida">Via Van Florida</option>
              <option value="via_vans_memphis">Via Vans Memphis</option>
              <option value="wash_baltimore">Wash Baltimore</option>
              <option value="williston_nd_lvl2">Williston ND LVL2</option>
              <option value="yakima_own_car">Yakima-Own-Car</option>
            </select>
            {errors.rentalZone && <p className="form-error">{errors.rentalZone.message}</p>}
          </div>
          <div className="form-field">
            <div className="form-label">Under 24h rental</div>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  {...register('under24hRental', { required: 'Under 24h rental is required' })}
                  value="Y"
                  className="radio-input"
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  {...register('under24hRental', { required: 'Under 24h rental is required' })}
                  value="N"
                  className="radio-input"
                />
                No
              </label>
            </div>
            {errors.under24hRental && <p className="form-error">{errors.under24hRental.message}</p>}
          </div>
          <div className="form-field">
            <div className="form-label">Business Leisure Indicator</div>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  {...register('businessLeisure', { required: 'Business Leisure Indicator is required' })}
                  value="L"
                  className="radio-input"
                />
                Leisure
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  {...register('businessLeisure', { required: 'Business Leisure Indicator is required' })}
                  value="B"
                  className="radio-input"
                />
                Business
              </label>
            </div>
            {errors.businessLeisure && <p className="form-error">{errors.businessLeisure.message}</p>}
          </div>
          <div className="form-field">
            <div className="form-label">Local Market Indicator</div>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  {...register('localMarketIndicator', { required: 'Local Market Indicator is required' })}
                  value="Y"
                  className="radio-input"
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  {...register('localMarketIndicator', { required: 'Local Market Indicator is required' })}
                  value="N"
                  className="radio-input"
                />
                No
              </label>
            </div>
            {errors.localMarketIndicator && <p className="form-error">{errors.localMarketIndicator.message}</p>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="distributionChannel">
              Distribution Channel
            </label>
            <select
              {...register('distributionChannel', { required: 'Distribution Channel is required' })}
              className="form-input"
              id="distributionChannel"
            >
              <option value="">Select...</option>
              <option value="avis_com">Avis com</option>
              <option value="cheaptickets">Cheaptickets</option>
              <option value="counter_and_all_other">Counter and all other</option>
              <option value="direct_connect">Direct connect</option>
              <option value="dynamic_tour">Dynamic tour</option>
              <option value="expedia">Expedia</option>
              <option value="gds">GDS</option>
              <option value="no_res_walk_up">No res/walk up</option>
              <option value="orbitz">Orbitz</option>
              <option value="priceline">Priceline</option>
              <option value="southwest">Southwest</option>
              <option value="travelocity">Travelocity</option>
              <option value="voice_res">Voice res</option>
            </select>
            {errors.distributionChannel && <p className="form-error">{errors.distributionChannel.message}</p>}
          </div>
          {mutation.error && <p className="form-error">{mutation.error.message}</p>}
        </div>
        <div className="form-footer">
          <button type="submit" className="button button-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomDataStep;
